import * as admin from 'firebase-admin';

export class ProductsService {
    db = admin.firestore();
  /* static getProducts: any; */

    async getProducts(): Promise<IProduct[]> {
        const products = await this.db.collection('products').get();
        const resultArray: IProduct[] = [];
        products.forEach((result) => {
            const data = result.data() as IProduct;
            data.id = result.id;
            resultArray.push(data);
        });       
       
        return resultArray;
    } 
    
   
   
    async getProductsByAccountId(accountId: string): Promise<IProduct[]> {
        const products = await this.db.collection('products').where('accountId', '==', accountId).get();
        const resultArray: IProduct[] = [];
        products.forEach((result) => {
            const data = result.data() as IProduct;
            data.id = result.id;
            resultArray.push(data);
        });       
       
        return resultArray;
    } 
}

