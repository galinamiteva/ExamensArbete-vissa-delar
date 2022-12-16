import * as admin from 'firebase-admin';

export class CustomersService {
    db = admin.firestore();
  static getUsers: any;

    async getCustomers(): Promise<ICustomer[]> {
        const customers = await this.db.collection('customers').get();
        const resultArray: ICustomer[] = [];
        customers.forEach((result) => {
            const data = result.data() as ICustomer;
            data.id = result.id;
            resultArray.push(data);
        });
        
       
        return resultArray;
    }

    async getCustomersByAccountId(accountId: string): Promise<ICustomer[]> {
        const customers = await this.db.collection('customers').where('accountId', '==', accountId).get();
        const resultArray: ICustomer[] = [];
        customers.forEach((result) => {
            const data = result.data() as ICustomer;
            data.id = result.id;
            resultArray.push(data);
        });
        
       
        return resultArray;
    }
}