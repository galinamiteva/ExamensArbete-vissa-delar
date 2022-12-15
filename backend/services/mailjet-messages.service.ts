

export function sendMailWithMailJet(to: string, subject: string, text: string, body: string) {
    const mailjet = require ('node-mailjet')
    .connect('1077b36a6a1b221715584c0170c40d35', '5840ba6d8370801fb3ea3316a0245172')
    const request = mailjet
    .post("send", {'version': 'v3.1'})
    .request({
      "Messages":[
        {
          "From": {
            "Email": "galinamiteva69@gmail.com",
            "Name": "GL AB"
          },
          "To": [
            {
              "Email": to,
              "Name": to
            }
          ],
          "Subject": subject,
          "TextPart": text,
          "HTMLPart": body,
          "CustomID": ""
        }
      ]
    })
request
  .then((result: any) => {
    console.log('Email API');
   
  })
  .catch((err: any) => {
    console.log('Email API');
    console.error(err.statusCode)
  });
}

export function sendSMSWithMailJet(from: string, phoneNumber: string, text: string) {
  const mailjet = require ('node-mailjet').connect('5840ba6d8370801fb3ea3316a0245172');
  const request = mailjet
    .post("sms-send", {'version': 'v4'})
    .request({
       "Text": text,
       "To": phoneNumber,
       "From": from
  })
request
	.then((result: any) => {
    console.log('SMS API');
		console.log(result.body)
	})
	.catch((err: any) => {
    console.log('SMS API');
		console.error(err.statusCode)
	})
}