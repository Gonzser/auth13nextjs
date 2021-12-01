import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import {verifyPassword} from '../../../lib/auth'

import{connectToDatabase} from '../../../lib/db'

export default NextAuth ({
  session: {
    jwt: true,
  },
  providers:[
    Providers.Credentials({
      async authorize(credentials){
        const client = await connectToDatabase();
        const usersCollection = client.db().collection('userDB');
        const user = await usersCollection.findOne({email: credentials.email})

        id(!user){
          client.close();
          throw new Error('User not found');
        }
        const isValid = await verifyPassword(credentials.password, user.password)

        if(!isValid){
          client.close();
          throw new Error('Could not Log you in')
        }

        client.close();
        return{email: user.email };
      }
    })
  ]
})