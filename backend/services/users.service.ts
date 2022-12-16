import * as admin from 'firebase-admin';

export class UsersService {
    db = admin.firestore();
  static getUsers: any;

    async getUsers(): Promise<IUser[]> {
        const users = await this.db.collection('users').get();
        const resultArray: IUser[] = [];
        users.forEach((result) => {
            const data = result.data() as IUser;
            data.id = result.id;
            resultArray.push(data);
        });
        
       
        return resultArray;
    }

    /* async getUsersByAccountId(accountId: string): Promise<IUser[]> {
        const users = await this.db.collection('users').where('accountId', '==', accountId).get();
        const resultArray: IUser[] = [];
        users.forEach((result) => {
            const data = result.data() as IUser;
            data.id = result.id;
            resultArray.push(data);
        });
        
       
        return resultArray;
    } */
}