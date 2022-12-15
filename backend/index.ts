import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import moment = require('moment');

import { Config } from './config';
import { AppService } from './services/app.service';
import { PromoCodesService } from './services/promocodes.service';
import { PinCodesService } from './services/pincodes.service';
import { MessageService } from './services/message.service';
import { SettingsService } from './services/settings.service';
import { SitesService } from './services/sites.service';
import { AccountsService } from './services/accounts.service';
import { CustomersService } from './services/customers.service';
import { UsersService } from './services/users.service';
import { ProductsService } from './services/products.service';
import { ContractProductsService } from './services/contract-products.service';
import { ExtraProductsService } from './services/extra-products.service';
import { CheckoutProductsService } from './services/checkoutproducts.service';
import { AdminGUIService } from './services/admingui.service';
import {validateFirebaseIdToken } from './utils/validateFirebaseIdToken';
import { sendMailWithMailJet, sendSMSWithMailJet } from './services/mailjet-messages.service';

import { SystemLogService } from './services/systemlog.service';
import { ScheduleJobsService } from './services/schedulejobs.service';
import { BookingService } from './services/bookingusers.service';
import { authorizationHeaderMiddleware } from './utils/express.util';
import { ToolsService } from './services/tools.service';



export let AppMainConfig: any = null;

admin.initializeApp({
  credential: admin.credential.cert(Config.service_account_cert),
  databaseURL:Config.firebase_database_url  
});

admin.firestore().settings({ timestampsInSnapshots: true, experimentalForceLongPolling: true  });
 const regionalFunctions = functions.region('europe-west1');
  
 const db = admin.firestore();



 export const usersService = new UsersService();
export const pinCodeService = new PinCodesService();
export const messageService = new MessageService();
export const promoCodesService = new PromoCodesService();
export const settingsService = new SettingsService();
export const sitesService = new SitesService();
export const accountsService = new AccountsService();
export const checkoutProductsService = new CheckoutProductsService();

export const customersService = new CustomersService();
export const productsService = new ProductsService();
export const contractProductsService = new ContractProductsService ;
export const extraProductsService = new ExtraProductsService();
export const adminGUIService = new AdminGUIService();
export const appService = new AppService();

import { Constants, getStripeKey } from './constants';
export const systemLogService = new SystemLogService();
export const scheduleJobsService = new ScheduleJobsService();
export const bookingService = new BookingService();
export const toolsService = ToolsService.Instance();

console.log('The emulators are on and env is>>> ',process.env.NODE_ENV);

import cors = require('cors');
const axios = require('axios').default;
const cookieParser = require('cookie-parser')();
var bodyParser = require('body-parser');
const stripe = require('stripe')(getStripeKey());

const pub = express();
pub.use(cors({ origin: true }));



// Public endpoints
// Get sites

pub.get('/sites', async (req, res) => {
  const sites = await appService.getSites();
  return res.status(200).send(sites);
});



// Get checkout

pub.get('/checkout/:id', async (req, res) => {
  try {
    const chargeObject = await appService.getCharge(req.params.id);
    return res.status(200).send({ error: false, charge: chargeObject });
  } catch (error) {
    return res.status(200).send({ error: error, charge: null });
  }
});

// Unreserve booking

pub.get('/unreserve-grouped-slot/:id', async (req, res) => {
  try {
    const result = await appService.unreserveGroupedSlots(req.params);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    /*  const errorResult = createError(error.message); */
    return res.status(500).send(error);
  }
});

// Hardware get bookings

pub.get('/slots-booked', async (req, res) => {
  const resultArray = await appService.slotsBooked();
  return res.status(200).send(resultArray);
});

// Get promo codes

pub.get('/promocode/:code', async (req, res) => {
  try {
    const promoCode = await promoCodesService.getPromoCodeObjectByCode(req.params.code);
    return res.status(200).send(promoCode);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

// Get booking
pub.get('/grouped-slots/:id', async (req, res) => {
  try {
    const slotGroup = await appService.getBooking(req.params.id);
    return res.status(200).send(slotGroup);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

// Get payment intent
pub.get('/payment-intent/:id', async (req, res) => {
  try {
    const paymentIntent = await appService.getPaymentIntent(req.params.id);
    return res.status(200).send({ error: false, payment_intent: paymentIntent });
  } catch (error) {
    return res.status(200).send({ error: error, payment_intent: null });
  }
});

pub.post('/payment-intent', async (req, res) => {
  try {
    const isBookingExist: boolean = await appService.isBookingExist(req.body.slotGroupId);
    if (!isBookingExist) {
      throw new Error('Could not find a valid booking');
    }

    const user: BookingUser = await bookingService.createBookingUser(req.body.bookingUser);
    if (!user) {
      throw new Error('Could not create booking-user');
    }

    const VALUE = req.body.amount * 100;
    const request: any = {
      amount: VALUE,
      currency: "sek",
      metadata: {
        'id': null,
        'firstName': req.body.customer.firstName,
        'lastName': req.body.customer.lastName,
        'email': req.body.customer.email,
        'slotGroupId': req.body.slotGroupId,
        'promoCode': req.body.promoCodeId,
        'userId': user.id,
      },
      payment_method_types: ['card'],
      description: req.body.specialNote,
      receipt_email: req.body.customer.email,
    };
    if (user.stripe_customer_id) {
      request.customer = user.stripe_customer_id
    }
    const paymentIntent = await stripe.paymentIntents.create(request);

    console.log("paymentIntent", paymentIntent);

    return res.status(200).send({ error: false, payment_intent: paymentIntent });
  } catch (error) {
    return res.status(500).send({ error: error, payment_intent: null });
  }
});

pub.get('/open-booking-lock/:groupSlotId', async (req, res) => {
  try {
    const booking = await appService.openLockWithButton(req.params.groupSlotId);
    return res.status(200).send({ error: false, result: booking });
  } catch (error) {
    return res.status(500).send({ error: error, result: null });
  }
});



exports.pub = regionalFunctions.https.onRequest(pub);

// Stripe webhook
exports.stripeWebhook = regionalFunctions.https.onRequest(async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    let endpointSecret = "";
    if (Constants.production) {
      

      //Production
      endpointSecret = "whsec_iTBnf2HUam89ads8YmLkXrTcwv9nBDCT";
    } else {
      //Stage
      endpointSecret = "whsec_nuPuPiJF8p7YjoKqr0Vux7R4i2N2B78i";
    }

    const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

   

    console.log("event", event);

    let intent = null;
    if (event.type === "payment_intent.succeeded") {
      intent = event.data.object;
      console.log("Succeeded:", intent.id);

      const booking = await bookingService.book(intent.metadata.slotGroupId, intent.metadata.userId, intent.metadata.promoCode, intent.amount);
      if (!booking) {
        throw new Error('Could not create booking');
      }
      console.log('intent.metadata');
      console.log(intent.metadata);
      // Create log for bookings
      await systemLogService.createBookingLog({
        userId: intent.metadata.userId,
        chargeId: intent.id,
        chargeType: 'Stripe',
        amountWithdrawn: intent.amount,
        created: new Date(),
        refunded: false,
        type: 'Booked'
      });

      await db.collection('slot_groups').doc(intent.metadata.slotGroupId).update({
        chargeInfo: {
          charge: intent.id,
          balance_transaction: intent.amount
        }
      });
    }

    res.status(200).send("success");
  } catch (err) {
    // invalid signature
    console.log(err);
    res.status(400).send("invalid signature");
  }
});
/*********************************************TOOL DEL********************************************************/


const tools = express();
tools.use(cors({ origin: true }));
tools.use((req: any, res: any, next: any) => {
  authorizationHeaderMiddleware(req, res, next);
});

tools.get('/test', async (req, res) => {
  try {
    const data = await db.collection('slots').where('siteId', '==', 'FuZh8tMLGXfYIV6qtopN').get();
    data.forEach(async (row) => {
      await db.collection("slots").doc(row.id).delete();
    })

    return res.status(200).send(data);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

tools.get('/reminder-start', async (req, res) => {
  try {
    const data = await scheduleJobsService.sendOutRemindersBeforeStart();
    return res.status(200).send(data);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

tools.get('/reminder-end', async (req, res) => {
  try {
    await scheduleJobsService.sendOutRemindersBeforeEnd();
    return res.status(200).send([]);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

tools.get('/confirmation-message/:slotGroupId', async (req, res) => {
  try {
    const groupSlot = await db.collection('slot_groups').doc(req.params.slotGroupId).get();
    if (groupSlot.data()) {
      await messageService.sendOutMessageToUserBookingCreated(groupSlot.data()?.userId, req.params.slotGroupId);
    }
    return res.status(200).send([]);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

/**
 * Slot Template
 */

tools.post('/slot_template', async (req, res) => {
  try {
    const model = {
      lockerId: req.body.lockerId,
      durationMinutes: 60,
      openHours: req.body.openHours,
      openStartHour: req.body.openStartHour,
      productId: req.body.productId,
      siteId: req.body.siteId,
      status: req.body.status,
    }
    await db.collection('slot_template').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

tools.get('/cancel-booking/:id/:refunded', async (req, res) => {
  try {
    let refundObject = null;
    let groupSlotModel = {};
    const refunded = req.params.refunded === 'true';
    const groupSlotId = String(req.params.id);
    console.log("groupSlotModel", groupSlotId);
    console.log("refunded", refunded);
    // Update slotGroup collection
    const slotGroup = await db.collection('slot_groups').doc(groupSlotId).get();
    const slotGroupData = slotGroup.data();
    if (slotGroupData) {
      if (refunded === true && slotGroupData?.chargeInfo) {
        refundObject = await stripe.refunds.create({
          payment_intent: slotGroupData.chargeInfo.charge,
        });

        await systemLogService.createBookingLog({
          userId: slotGroupData.userId,
          chargeId: refundObject?.id,
          chargeType: 'Stripe',
          amountWithdrawn: refundObject?.amount,
          created: new Date(),
          refunded: refundObject !== undefined ? true : false,
          type: 'Canceled'
        });

        groupSlotModel = {
          canceled: true,
          refunded: true
        }

        await messageService.sendOutMessageToUserBookingCanceled(slotGroupData.userId, slotGroup.id);
      } else {
        groupSlotModel = {
          canceled: true
        }
      }
      const model = {
        slotGroupId: null
      }
      for (const slotId of slotGroupData.slotIds) {
        await db.collection('slots').doc(slotId).update(model);
      }
      await db.collection('slot_groups').doc(groupSlotId).update(groupSlotModel);
      return res.status(200).send({ slotGroup: slotGroup, refund: refundObject });
    } else {
      return res.status(200).send(null);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

tools.get('/clear-slot_groups', async (req, res) => {
  try {
    //fiftenMinutes.seconds = fiftenMinutes.seconds - (60 * 15);
    const slotGroup = await db.collection('slot_groups').get();

    slotGroup.forEach(async (result: any) => {

      const slotGroupData = result.data();
      console.log(result.id);
      // console.log(slotGroupData);

      try {
        for (const slotId of slotGroupData.slotIds) {
          await db.collection('slots').doc(slotId).update({ slotGroupId: null });
        }
        await db.collection('slot_groups').doc(result.id).delete();
      } catch (error) {
        throw error;
      }
    });
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

tools.post('/slot-population', async (req, res) => {
  const startDate = req.body.startDate;
  const days: number = Number(req.body.days);
  // const slotTempaltes = await db.collection('slot_template').where('status', '==', 1).get();
  const slotTempaltes: any[] = req.body.slotTempaltes;

  console.log(startDate);
  console.log(days);
  console.log(slotTempaltes);

  console.log('slot_template generate start');
  slotTempaltes.forEach(async (result) => {
    const slotTemplateData = result;

    for (let i = 0; i <= days; i++) {
      const _startTimeForSlot = moment(startDate, 'YYYYMMDD').utc().add(i, 'days').add(slotTemplateData.openStartHour, 'hours');
      const totalOpenHours = slotTemplateData.openStartHour + slotTemplateData.openHours;
      const _endTimeForSlot = moment(startDate, 'YYYYMMDD').utc().add(i, 'days').add(totalOpenHours, 'hours');

      let timeDiff = 1;
      let _nextTimeForSlot = moment(_startTimeForSlot).utc();
      let durationMinutes = 0;
      while (timeDiff > 0) {
        //console.log('Start!');
        _nextTimeForSlot = moment(_nextTimeForSlot).utc().add(durationMinutes, 'minutes');
        timeDiff = _endTimeForSlot.diff(_nextTimeForSlot, 'minutes');

        //console.log(_nextTimeForSlot);
        //console.log(timeDiff);
        durationMinutes = slotTemplateData.durationMinutes;

        try {
          const _nextTimeForSlotTemp = moment(_nextTimeForSlot).utc();
          const _nextTimeForSlotTemp2 = moment(_nextTimeForSlot).utc().add(slotTemplateData.durationMinutes, 'minutes');
          const model = {
            startTime: _nextTimeForSlotTemp,
            endTime: _nextTimeForSlotTemp2,
            startTimeStr: moment(_nextTimeForSlotTemp).utc().format('YYYY-MM-DD HH') + ':00',
            endTimeStr: moment(_nextTimeForSlotTemp2).utc().format('YYYY-MM-DD HH') + ':00',
            lockerId: slotTemplateData.lockerId,
            productId: slotTemplateData.productId,
            siteId: slotTemplateData.siteId,
            discount: false,
            slotGroupId: null,
            index: i,
            name: slotTemplateData.name,
            created: moment(),
          }
          await db.collection('slots').add(model);
        } catch (error) {
          console.log(error);
          return res.status(500).send(error);
        }
      }
    }
    return res.status(200).send([]);
  });
});



tools.post('/promocode', async (req, res) => {
  try {
    const model: IPromoCode = {
      id: req.body.id,
      accountId: req.body.accountId,
      companyName: req.body.companyName,
      code: req.body.code,
      procentDiscount: req.body.procentDiscount,
      tries: req.body.tries,
      created: new Date(),
      validUntil: new Date(req.body.validUntil),
    };
    const promoCode = await promoCodesService.createPromoCode(model);
    return res.status(200).send(promoCode);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

tools.post('/send-sms-to-all-booking-users', async (req, res) => {
  try {
    const model: any = {
      text: req.body.text,
    };

    const documents = await db.collection("booking-users").get()
    const resultArray: any = [];
    documents.forEach((result) => {
      const data = result.data();
      data.id = result.id;
      resultArray.push(data);

      if (data.phoneNumber && String(data.phoneNumber).length > 0) {
        sendSMSWithMailJet('GL AB', data.phoneNumber, model.text, );
      }
    });

    return res.status(200).send(resultArray);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

tools.post('/accountsandsites', async (req, res) => {
  try {
    console.log(req.body);
    const info = await toolsService.postSiteAndAccountInfo(req.body);
    return res.status(200).send(info);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

//exports.tools = functions.https.onRequest(tools);
exports.tools = regionalFunctions.runWith({ memory: '4GB', timeoutSeconds: 540 }).https.onRequest(tools);
/*********************************************COMMAND********************************************************/

const app = express();
app.use(cors({ origin: true }));
app.use((req: any, res: any, next: any) => {
  authorizationHeaderMiddleware(req, res, next);
});

app.post('/command', async (req, res) => {
  console.log(req.body);
  try {
    const headers = {
      'headers': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'SuperDuperHemligt'
      }
    };
    const payload = {
      command: req.body.command,
      lockerId: req.body.lockerId,
      stationId: req.body.stationId
    };
    console.log('payload: ');
    console.log(payload);

    const resp = await axios.post('https://www.cloudsolution.se/backend/IOT/GL/command', payload, headers);
    if (resp.status === 200 || resp.status === 201) {
      return res.status(200).send(resp.data);
    } else {
      console.log(resp.data);
      return res.status(500).send(resp.data);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

/**
 * Stations
 */

app.get('/stations', async (req, res) => {
  const documents = await db.collection('stations').get();
  const resultArray: any = [];
  documents.forEach((result) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
});

app.post('/station', async (req, res) => {
  try {
    const model = {
      name: req.body.name,
      status: req.body.status,
      online: req.body.online,
      location: req.body.location,
      created: new Date()
    }
    await db.collection('stations').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.delete('/station/:id', async (req, res) => {
  try {
    await db.collection('stations').doc(req.params.id).delete();
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


/**
 * Lockers
 */

app.get('/lockers', async (req, res) => {
  const documents = await db.collection('lockers').get();
  const resultArray: any = [];
  documents.forEach((result) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
});

app.get('/lockersx/:stationId', async (req, res) => {
  const documents = await db.collection('lockers').where('stationId', '==', req.params.stationId).get();
  const resultArray: any = [];
  documents.forEach((result) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
});

app.post('/locker', async (req, res) => {
  try {
    const model = {
      lockerId: req.body.lockerId,
      stationId: req.body.stationId,
      status: req.body.status,
      created: new Date()
    }
    await db.collection('lockers').add(model);
    return res.status(200).send(model);

  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.delete('/locker/:id', async (req, res) => {
  try {
    await db.collection('lockers').doc(req.params.id).delete();
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

/**
 * Sites
 */

app.get('/site', async (req, res) => {
  const sites = await appService.getSites();
  return res.status(200).send(sites);
});

/**
 * Products
 */

app.get('/products', async (req, res) => {
  const documents = await db.collection('products').get();
  const resultArray: any = [];
  documents.forEach((result) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
});

exports.app = regionalFunctions.https.onRequest(app);

/**
 * booking API
 */

const book = express();
book.use(cors({ origin: true }));
/*
book.use((req: any, res: any, next: any) => {
  authorizationHeaderMiddleware(req, res, next);
});
*/



book.get('/bookings-formated', async (req, res) => {
  try {
    const results = await appService.getBookingsFormated();
    return res.status(200).send(results);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

//.format('YYYY-MM-DD h:mm:ss')
book.get('/slots', async (req, res) => {
  const documents = await db.collection('slots').get();
  const resultArray: any = [];
  documents.forEach((result) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
});

// Return all slot_group
book.get('/slots-booked', async (req, res) => {
  const documents = await db.collection('slot_groups').where('isPaid', '==', true).where('canceled', '==', false).get();
  const resultArray: any = [];
  documents.forEach((result) => {
    const data = result.data();
    if (data.userId) {
      data.id = result.id;
      resultArray.push(data);
    }
  });
  return res.status(200).send(resultArray);
});

exports.booking = regionalFunctions.runWith({ memory: '4GB', timeoutSeconds: 540 }).https.onRequest(book);




/********************************************************************************************************************************************************/
/*************************************************ADMIN DEL*************************************************************/
/********************************************************************************************************************************************************/
const adm = express();
adm.use(cors({ origin: true }));


declare global {
  namespace Express {
    interface Request {
      user?: Record<string,any>
    }
  }
}

adm.use(cookieParser);
adm.use(bodyParser.json());
adm.use(bodyParser.urlencoded({ extended: false }));



//CRUD Sites*****************************************************************************
adm.get('/sites_simple', async (req, res) => {
  try {
    const sites = await sitesService.getSites();
    return res.status(200).send(sites);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

adm.get('/sites', validateFirebaseIdToken, async (req, res) => {  
  const accIdFromToken = req.body.user.accountId;  
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const sites = await sitesService.getSitesByAccountId(accIdFromToken);
    return res.status(200).send(sites);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
  }else{
    try {
      const sites = await sitesService.getSites();
      return res.status(200).send(sites);
    } catch (error) {
      console.log('error' + error);
      return res.status(500).send(error);
    }
  }
});

adm.delete('/site/:id', async (req, res) => {

  try {
    await db.collection('sites').doc(req.params.id).delete()
    console.log("en site var deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


adm.post('/site', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      name: req.body.name,
      accountId: accIdFromToken
    }
    await db.collection('sites').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      name: req.body.name,
      accountId: req.body.accountId
    }
    await db.collection('sites').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
});


adm.patch('/site/:id', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      name: req.body.name,
      accountId: accIdFromToken,
    }
    const site = await db.collection('sites').doc(req.params.id).update(model);
    return res.status(200).send(site);
  } catch (error) {
    throw error;
  }
}else{
  try {
    const model = {
      name: req.body.name,
      accountId: req.body.accountId,
    }
    const site = await db.collection('sites').doc(req.params.id).update(model);
    return res.status(200).send(site);
  } catch (error) {
    throw error;
  }
}
});


// PROMO CODES CRUD *****************************************************************************


adm.get('/promo-codes',validateFirebaseIdToken, async (req, res) => {
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {   
    
    const promoCodes = await promoCodesService.getPromoCodesByAccountId(req.body.user.accountId);
    return res.status(200).send(promoCodes);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }}else{
    try {
      //if USER ROLE == ADMIN      
      const promoCodes = await promoCodesService.getPromoCodes();     
      return res.status(200).send(promoCodes);
    } catch (error) {
      console.log('error' + error);
      return res.status(500).send(error);
  }
  }
});


adm.post('/promo-code', validateFirebaseIdToken, async (req, res) => {  
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){   
  try {
    const model = {
      accountId: accIdFromToken,
      code: req.body.code,
      created: new Date(),
      procentDiscount: req.body.procentDiscount,
      tries: req.body.tries,
      validUntil: new Date(req.body.validUntil)
    }
    await db.collection('promocodes').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      accountId: req.body.accountId,
      code: req.body.code,
      created: new Date(),
      procentDiscount: req.body.procentDiscount,
      tries: req.body.tries,
      validUntil: new Date(req.body.validUntil)
    }
    await db.collection('promocodes').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

});

adm.patch('/promo-code/:id', validateFirebaseIdToken, async (req, res) => {  
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      accountId: accIdFromToken,
      code: req.body.code,
      created: new Date(),
      procentDiscount: req.body.procentDiscount,
      tries: req.body.tries,
      validUntil: new Date(req.body.validUntil)
    }

    const account = await db.collection('promocodes').doc(req.params.id).update(model);
    return res.status(200).send(account);
  } catch (error) {
    throw error;
  }
}else{
  try {
    const model = {
      accountId: req.body.accountId,
      code: req.body.code,
      created: new Date(),
      procentDiscount: req.body.procentDiscount,
      tries: req.body.tries,
      validUntil: new Date(req.body.validUntil)
    }

    const account = await db.collection('promocodes').doc(req.params.id).update(model);
    return res.status(200).send(account);
  } catch (error) {
    throw error;
  }
}
});


adm.delete('/promo-code/:id', async (req, res) => {
  try {
    await db.collection('promocodes').doc(req.params.id).delete();
    console.log("Promo code has been deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


//Account CRUD *****************************************************************************

adm.get('/accounts', async (req, res) => {
  try {
    const accounts = await accountsService.getAccounts();
    return res.status(200).send(accounts);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});


adm.delete('/account/:id', async (req, res) => {
  try {
    await db.collection('accounts').doc(req.params.id).delete();
    console.log("en account var deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.post('/account', async (req, res) => {
  
  try {
    const model = {
      companyName: req.body.companyName,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      type: req.body.type
    }
    await db.collection('accounts').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.patch('/account/:id', async (req, res) => {
  try {
    const model = {
      companyName: req.body.companyName,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      type: req.body.type
    }

    const account = await db.collection('accounts').doc(req.params.id).update(model);
    return res.status(200).send(account);
  } catch (error) {
    throw error;
  }
});
adm.get('/accounts', async (req, res) => {
  try {
    const accounts = await accountsService.getAccounts();
    return res.status(200).send(accounts);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});


adm.delete('/account/:id', async (req, res) => {
  try {
    await db.collection('accounts').doc(req.params.id).delete();
    console.log("en account var deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});




//CRUD  CHECKOUT PRODUCTS *****************************************************************************

adm.get('/checkout-products', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const checkoutProducts = await checkoutProductsService.getCheckoutProductsByAccountId(accIdFromToken);
    return res.status(200).send(checkoutProducts);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
}else{

    try {
      const checkoutProducts = await checkoutProductsService.getCheckoutProducts();
      return res.status(200).send(checkoutProducts);
    } catch (error) {
      console.log('error' + error);
      return res.status(500).send(error);
    }
}
}); 

adm.delete('/checkout-product/:id', async (req, res) => {  
  try {
    await db.collection('checkout-products').doc(req.params.id).delete();
    console.log("en checkout-product var deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.post('/checkout-product',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      name: req.body.name,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      accountId: accIdFromToken,
      status: req.body.status,
      created: new Date()
    }
    await db.collection('checkout-products').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      name: req.body.name,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      accountId: req.body.accountId,
      status: req.body.status,
      created: new Date()
    }
    await db.collection('checkout-products').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
});


adm.patch('/checkout-product/:id', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){

    try {
      const model = {
        name: req.body.name,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        accountId: accIdFromToken,
        status: req.body.status,
        created: new Date()
      }
      await db.collection('checkout-products').doc(req.params.id).update(model);
      return res.status(200).send(model);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }else{
    try {
      const model = {
        name: req.body.name,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        accountId: req.body.accountId,
        status: req.body.status,
        created: new Date()
      }
      await db.collection('checkout-products').add(model);
      return res.status(200).send(model);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
});
//CRUD products *****************************************************************************

adm.get('/products_simple', async (req, res) => {
  try {
    const products = await productsService.getProducts();
    return res.status(200).send(products);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

adm.get('/products', validateFirebaseIdToken, async (req, res) => {
  
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){    
  try {
    const products = await productsService.getProductsByAccountId(accIdFromToken);
    return res.status(200).send(products);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
}else{
  try {
    //if USER ROLE == ADMIN  
    const products = await productsService.getProducts();
    return res.status(200).send(products);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }

}
});

adm.delete('/product/:id', async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    console.log("en product var deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.post('/product', validateFirebaseIdToken, async (req, res) => {
  console.log('DU GJORDE POST', req.body.user)
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){  
  try {
    const model = {
      accountId: accIdFromToken,
      name: req.body.name,
      hourPrice: req.body.hourPrice,      
      imageUrl: req.body.imageUrl,
      status: req.body.status,
    }

    await db.collection('products').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
  }else{
    try {
      const model = {
        name: req.body.name,
        hourPrice: req.body.hourPrice,
        accountId: req.body.accountId,
        imageUrl: req.body.imageUrl,
        status: req.body.status,
      }
  
      await db.collection('products').add(model);
      return res.status(200).send(model);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }  
});

adm.patch('/product/:id', validateFirebaseIdToken, async (req, res) => {
  
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      accountId: accIdFromToken,
      name: req.body.name,
      hourPrice: req.body.hourPrice,      
      imageUrl: req.body.imageUrl,
      status: req.body.status,
    }
    const product = await db.collection('products').doc(req.params.id).update(model);
    return res.status(200).send(product);
  } catch (error) {
    throw error;
  }
  }else{
    try {
      const model = {  
        name: req.body.name,
        hourPrice: req.body.hourPrice,
        accountId: req.body.accountId,
        imageUrl: req.body.imageUrl,
        status: req.body.status,
      }
      const product = await db.collection('products').doc(req.params.id).update(model);
      return res.status(200).send(product);
    } catch (error) {
      throw error;
    }
  }
});
//CRUD CONTRACT products *********************************************************
adm.get('/contract-products', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const contrProducts = await contractProductsService.getContractProductsByAccountId(accIdFromToken);
    return res.status(200).send(contrProducts);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
}else{  
    try {
      const contrProducts = await contractProductsService.getContractProducts();
      return res.status(200).send(contrProducts);
    } catch (error) {
      console.log('error' + error);
      return res.status(500).send(error);
    }
  
}
});

adm.delete('/contract-product/:id', async (req, res) => {
  try {
    await db.collection('contract-products').doc(req.params.id).delete();
    console.log("en contrProducts var deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.post('/contract-product',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){ 
  try {
    const model = {
      accountId: accIdFromToken,
      created: new Date(),      
      name: req.body.name,           
      price: req.body.price,
      status: req.body.status,
    }

    await db.collection('contract-products').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      accountId: req.body.accountId,
      created: new Date(),      
      name: req.body.name,           
      price: req.body.price,
      status: req.body.status,
    }

    await db.collection('contract-products').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
});

adm.patch('/contract-product/:id',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      accountId: accIdFromToken,
      created: new Date(),      
      name: req.body.name,           
      price: req.body.price,
      status: req.body.status,
    }
    const contrProduct = await db.collection('contract-products').doc(req.params.id).update(model);
    return res.status(200).send(contrProduct);
  } catch (error) {
    throw error;
  }
}else{
  try {
    const model = {
      accountId: req.body.accountId,
      created: new Date(),      
      name: req.body.name,           
      price: req.body.price,
      status: req.body.status,
    }
    const contrProduct = await db.collection('contract-products').doc(req.params.id).update(model);
    return res.status(200).send(contrProduct);
  } catch (error) {
    throw error;
  }
}
});
//CRUD EXTRA products *********************************************************
adm.get('/extra-products',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const extraProducts = await extraProductsService.getExtraProductsByAccountId(accIdFromToken);
    return res.status(200).send(extraProducts);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
}else{
  try {
    const extraProducts = await extraProductsService.getExtraProducts();
    return res.status(200).send(extraProducts);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
}
});

adm.delete('/extra-product/:id', async (req, res) => {
  try {
    await db.collection('extra-products').doc(req.params.id).delete();
    console.log("en extraProduct var deleted")
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.post('/extra-product',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      accountId: accIdFromToken,
      productId: req.body.productId,
      created: new Date(),
      name: req.body.name,      
      imageUrl: req.body.imageUrl,
      status: req.body.status,
    }

    await db.collection('extra-products').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      accountId: req.body.accountId,
      productId: req.body.productId,
      created: new Date(),
      name: req.body.name,      
      imageUrl: req.body.imageUrl,
      status: req.body.status,
    }

    await db.collection('extra-products').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
});

adm.patch('/extra-product/:id',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      accountId: accIdFromToken,
      productId: req.body.productId,
      created: new Date(),
      name: req.body.name,      
      imageUrl: req.body.imageUrl,
      status: req.body.status,
    }
    const extraProduct = await db.collection('extra-products').doc(req.params.id).update(model);
    return res.status(200).send(extraProduct);
  } catch (error) {
    throw error;
  }
}else{
  try {
    const model = {
      accountId: req.body.accountId,
      productId: req.body.productId,
      created: new Date(),
      name: req.body.name,      
      imageUrl: req.body.imageUrl,
      status: req.body.status,
    }
    const extraProduct = await db.collection('extra-products').doc(req.params.id).update(model);
    return res.status(200).send(extraProduct);
  } catch (error) {
    throw error;
  }
}
});

//CRUD CUSTOMERS *****************************************************************************
adm.get('/customers_simple', async (req, res) => {
  try {

    const customers = await customersService.getCustomers()
    return res.status(200).send(customers);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});

adm.get('/customers', validateFirebaseIdToken,async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){   
  try {

    const customers = await customersService.getCustomersByAccountId(accIdFromToken)
    return res.status(200).send(customers);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
}else{
  try {

    const customers = await customersService.getCustomers()
    return res.status(200).send(customers);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
}
});


adm.delete('/customer/:id', async (req, res) => {  
  try {
    await db.collection('customers').doc(req.params.id).delete();
    console.log("en customer from customers var deleted")

    return res.status(204).send({})

  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.post('/customer', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){  
  try {
    const model = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      accountId: accIdFromToken,
      phoneNumber: req.body.phoneNumber,
      created: new Date()
    }

    await db.collection('customers').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      accountId: req.body.accountId,
      phoneNumber: req.body.phoneNumber,
      created: new Date()
    }

    await db.collection('customers').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
});

adm.patch('/customer/:id', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){  
  try {
    const model = {

      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      accountId: accIdFromToken,
      phoneNumber: req.body.phoneNumber,
      created: new Date()
    }
    const customer = await db.collection('customers').doc(req.params.id).update(model);
    return res.status(200).send(customer);
  } catch (error) {
    throw error;
  }
}else{
  try {
    const model = {

      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      accountId: req.body.accountId,
      phoneNumber: req.body.phoneNumber,
      created: new Date()
    }
    const customer = await db.collection('customers').doc(req.params.id).update(model);
    return res.status(200).send(customer);
  } catch (error) {
    throw error;
  }
}
});


//CRUD  USERS *****************************************************************************



adm.get('/users', async (req, res) => {
  try {

    const users = await usersService.getUsers()
    return res.status(200).send(users);
  } catch (error) {
    console.log('error' + error);
    return res.status(500).send(error);
  }
});



adm.delete('/user/:id', async (req, res) => {
  try {
    const id = req.params.id  // eller const uid = req.params.uid
    await db.collection('users').doc(req.params.id).delete();
    console.log("en user from users var deleted")
    await admin.auth().deleteUser(id)
    console.log("en user UID var deleted")
    return res.status(204).send({})

  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});



adm.post('/user', async (req, res) => {
  console.log('REQ-BODY', req.body)
  if (req.body.role === 'ADMIN_USER') {
    try {
      const customClaims = {
        role:'ADMIN_USER',   //det kan bli role:'ADMIN_USER' eller ADMIN_USER: true om vi behöver !
        accountId: req.body.accountId
      };
      const createdUserRecord = await admin.auth().createUser({
        email: req.body.email,
        emailVerified: false,
        password: req.body.password,
        displayName: req.body.name
      });

      await admin.auth().setCustomUserClaims(createdUserRecord.uid, customClaims);
      const updatedUserRecord = await admin.auth().getUser(createdUserRecord.uid);
      await db.collection('users').doc(updatedUserRecord.uid).set({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        accountId: req.body.accountId,        
        role: req.body.role
      });

      if (!updatedUserRecord.emailVerified) {
        await admin.auth().generateEmailVerificationLink(req.body.email)
          .then((link) => {
            const mailOptions = {

              To: req.body.email,
              Subject: `Verify your email for GL-Stage`,
              TextPart: "<p>Thanks.</p>",
              "HTMLPart": `<p>Hello ${req.body.name}, </p>
          <p>These are your credentials in GL App:</p>
          <p> email:<b>${req.body.email}</b>, password:<b>${req.body.password}</b> and name:<b>${req.body.name}</b>.</p>
          <p>Follow this link <a href='${link}'> verification </a>to verify your email address.</p>
           <p>If you didn’t ask to verify this address, you can ignore this email.</p>
           <p>Thanks,</p>
           
           <p>Your GL team! </p>`
            }
            sendMailWithMailJet(mailOptions.To, mailOptions.Subject, mailOptions.TextPart, mailOptions.HTMLPart);
            admin.auth().updateUser(updatedUserRecord.uid, { emailVerified: true })
              .then(
                (result) => {
                  console.log('Email verified without user interaction.');
                },
                (err) => {
                  console.error(err)
                }
              )
          })
      } else {
        console.log('Тhe email already exists ')
      };

      return res.status(200).send({ updatedUserRecord });

    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  } else {
    console.log('REQ-BODY', req.body)
    try {
      const customClaims = {
        role:'ACCOUNT_USER',  //det kan bli role:'ACCOUNT_USER' eller ACCOUNT_USER: true om vi behöver !
        accountId: req.body.accountId
      };
      const createdUserRecord = await admin.auth().createUser({
        email: req.body.email,
        emailVerified: false,
        password: req.body.password,
        displayName: req.body.name
      });
      await admin.auth().setCustomUserClaims(createdUserRecord.uid, customClaims);
      const updatedUserRecord = await admin.auth().getUser(createdUserRecord.uid);
      await db.collection('users').doc(updatedUserRecord.uid).set({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        accountId: req.body.accountId,        
        role: req.body.role
      });
      if (!updatedUserRecord.emailVerified) {
        await admin.auth().generateEmailVerificationLink(req.body.email)
          .then((link) => {
            const mailOptions = {

              To: req.body.email,
              Subject: `Verify your email for GL-Stage`,
              TextPart: "<p>Thanks.</p>",
              "HTMLPart": `<p>Hello ${req.body.name}, </p>
            <p>These are your credentials in GL App:</p>
            <p> email:<b>${req.body.email}</b>, password:<b>${req.body.password}</b> and name:<b>${req.body.name}</b>.</p>
            <p>Follow this link <a href='${link}'> verification </a>to verify your email address.</p>
             <p>If you didn’t ask to verify this address, you can ignore this email.</p>
  
             <p>Thanks,</p>
             
             <p>Your GL team! </p>`
            };
            sendMailWithMailJet(mailOptions.To, mailOptions.Subject, mailOptions.TextPart, mailOptions.HTMLPart);
            admin.auth().updateUser(updatedUserRecord.uid, { emailVerified: true })
              .then(
                (result) => {
                  console.log('Email verified without user interaction.');
                },
                (err) => {
                  console.error(err)
                }
              )
          })
      } else {
        console.log('Тhe email already exists ')
      };

      return res.status(200).send({ updatedUserRecord });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    };
  };
});



adm.patch('/user/:id', async (req, res) => {  
  if (req.body.role === 'ACCOUNT_USER') {
    try {
      const customClaims = {
        role:'ACCOUNT_USER',  //det kan bli role:'ADMIN_USER' eller ADMIN_USER: true om vi behöver !
        accountId: req.body.accountId
      };
      const uid = req.params.id;
      const userRecord = await admin.auth().updateUser(uid, {
        emailVerified: true ? true : false,
        displayName: req.body.name
      });
      await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
      const updatedUserRecord = await admin.auth().getUser(userRecord.uid);
      await db.collection('users').doc(updatedUserRecord.uid).set({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        accountId: req.body.accountId,        
        role: req.body.role
      });

      if (updatedUserRecord.emailVerified === true) {
        await admin.auth().generateEmailVerificationLink(req.body.email)
          .then((link) => {
            const mailOptions = {

              To: req.body.email,
              Subject: `Verify your email for GL-Stage`,
              TextPart: "<p>Thanks.</p>",
              "HTMLPart": `<p>Hello ${req.body.name}, </p>
               <p>These are your <b> changed credentials </b> in GL App:</p>
               <p> email:<b>${req.body.email}</b>, password:<b>${req.body.password}</b> and name:<b>${req.body.name}</b>.</p>
               <p>Follow this link <a href='${link}'> verification </a>to verify your email address.</p>
                <p>If you didn’t ask to verify this address, you can ignore this email.</p>
     
                <p>Thanks,</p>
                
                <p>Your GL team! </p>`
            };
            sendMailWithMailJet(mailOptions.To, mailOptions.Subject, mailOptions.TextPart, mailOptions.HTMLPart);

          })
      } else {
        console.log('Тhe email are inte verifierad')
      };

      return res.status(200).send({ updatedUserRecord });

      return res.status(200).send({ updatedUserRecord });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }

  } else {
    try {
      const customClaims = {
        role:'ADMIN_USER',  //det kan bli role:'ADMIN_USER' eller ADMIN_USER: true om vi behöver !
        accountId: req.body.accountId
      };
      const uid = req.params.id;
      const userRecord = await admin.auth().updateUser(uid, {
        emailVerified: true ? true : false,
        displayName: req.body.name
      });
      await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
      const updatedUserRecord = await admin.auth().getUser(userRecord.uid);
      await db.collection('users').doc(updatedUserRecord.uid).set({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        accountId: req.body.accountId,        
        role: req.body.role
      });

      if (updatedUserRecord.emailVerified === true) {
        await admin.auth().generateEmailVerificationLink(req.body.email)
          .then((link) => {
            const mailOptions = {

              To: req.body.email,
              Subject: `Verify your email for GL-Stage`,
              TextPart: "<p>Thanks.</p>",
              "HTMLPart": `<p>Hello ${req.body.name}, </p>
            <p>These are your <b> changed credentials </b> in GL App:</p>
            <p> email:<b>${req.body.email}</b>, password:<b>${req.body.password}</b> and name:<b>${req.body.name}</b>.</p>
            <p>Follow this link <a href='${link}'> verification </a>to verify your email address.</p>
             <p>If you didn’t ask to verify this address, you can ignore this email.</p>
  
             <p>Thanks,</p>
             
             <p>Your GL team! </p>`
            };
            sendMailWithMailJet(mailOptions.To, mailOptions.Subject, mailOptions.TextPart, mailOptions.HTMLPart);

          })
      } else {
        console.log('Тhe email are inte verifierad')
      };

      return res.status(200).send({ updatedUserRecord });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
});

//CRUD LOCKERS *****************************************************************************

adm.post('/station-detail/:stationId', async (req, res) => {
  try {
    const model = {
      lockerNumber: '0',
      stationId: req.params.stationId,
      productId: req.body.productId,
      created: new Date()
    }
    await db.collection('lockers').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

//lockers med likadana StationId
adm.get('/station-detail/:stationId', async (req, res) => {

  const id = req.params.stationId
  const documents = await db.collection('lockers').where('stationId', '==', id).get();

  const resultArray: any = [];
  documents.forEach((result) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
});

adm.patch('/station-detail/:stationId/:lockerId', async (req, res) => {
  try {
    const model = {
      lockerNumber: '0',
      /* stationId:req.params.stationId,  */
      productId: req.body.productId,
      created: new Date()
    }
    const locker = await db.collection('lockers').doc(req.params.lockerId).update(model);
    return res.status(200).send(locker);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.patch('/station-detail/:stationId/:lockerId', async (req, res) => {
  try {
    const model = {
      lockerNumber: '0',
      /* stationId:req.params.stationId,  */
      productId: req.body.productId,
      created: new Date()
    }
    const locker = await db.collection('lockers').doc(req.params.lockerId).update(model);
    return res.status(200).send(locker);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});
//CRUD  STATION *****************************************************************************

adm.get('/stations_simple', async (req, res) => {
  const documents = await db.collection('stations').get();
  const resultArray: any = [];
  documents.forEach((result: any) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);

});

adm.get('/stations',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){
 const documents = await db.collection('stations').where('accountId', '==', accIdFromToken).get();
  const resultArray: any = [];
  documents.forEach((result: any) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
}else{
  const documents = await db.collection('stations').get();
  const resultArray: any = [];
  documents.forEach((result: any) => {
    const data = result.data();
    data.id = result.id;
    resultArray.push(data);
  });
  return res.status(200).send(resultArray);
  }
});



adm.post('/station',validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId;
  if(req.body.user.role ==='ACCOUNT_USER'){  
  try {
    const model = {
      name: req.body.name,
      accountId: accIdFromToken,
      siteId: req.body.siteId,
      status: req.body.status,
      created: new Date()
    }
    await db.collection('stations').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      name: req.body.name,
      accountId: req.body.accountId,
      siteId: req.body.siteId,
      status: req.body.status,
      created: new Date()
    }
    await db.collection('stations').add(model);
    return res.status(200).send(model);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
});


adm.delete('/station/:id', async (req, res) => {
  try {
    await db.collection('stations').doc(req.params.id).delete();
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

adm.patch('/station/:id', validateFirebaseIdToken, async (req, res) => {
  const accIdFromToken = req.body.user.accountId
  if(req.body.user.role ==='ACCOUNT_USER'){
  try {
    const model = {
      name: req.body.name,
      accountId: accIdFromToken,
      siteId: req.body.siteId,
      status: req.body.status,
      created: new Date()
    }
    const station = await db.collection('stations').doc(req.params.id).update(model);
    return res.status(200).send(station);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}else{
  try {
    const model = {
      name: req.body.name,
      accountId: req.body.accountId,
      siteId: req.body.siteId,
      status: req.body.status,
      created: new Date()
    }
    const station = await db.collection('stations').doc(req.params.id).update(model);
    return res.status(200).send(station);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
});





exports.adm = regionalFunctions.https.onRequest(adm);
