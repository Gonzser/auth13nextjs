//protect api fetchs from no authorized access
import { getSession } from "next-auth/client";
import { signIn } from "next-auth/client";

import { verifyPassword, hashPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

async function handler(req, res) {
  if (req.method !== "PATCH") {
    return;
  }

  const session = await getSession({ req: req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated!" });
    return;
  }
  const userEmail = session.user.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  // // console.logs to see
  // console.log(session);
  // console.log(userEmail);
  // console.log(req.body);

  const client = await connectToDatabase();

  const usersCollection = client.db().collection("userDB");

  const user = await usersCollection.findOne({ email: userEmail });

  if (!user) {
    res.status(404).json({ message: "User error, emails doesnt exists" });
    client.close();
    return;
  }

  const currentPassword = user.password;

  // viendo que magia
  console.log('viendo que password');
  console.log(currentPassword);
  const hashedOldPassword = await hashPassword(oldPassword)
  console.log('viendo que password');
  console.log(hashedOldPassword);

  const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);
  console.log('passwordsAreEqual');
  console.log(passwordsAreEqual);

  // const credResult = await signIn("credentials", {
  //   redirect: false,
  //   email: userEmail,
  //   password: oldPassword,
  // });
  //
  // console.log('credResult');
  // console.log(credResult);
  //
  // if(!credResult.error) {console.log('User exists and it is the correct password');
  // console.log(credResult);
  // // router.replace('/profile')
  // }

  if (!passwordsAreEqual) {
    res
      .status(422)
      .json({ message: "unAuthorized operation, information is incorrect" });
    client.close();
    return;
  }

  const newHashedPassword = await hashPassword(newPassword);

  const result = await usersCollection.updateOne(
    { email: userEmail },
    { $set: { password: newHashedPassword } }
  );
  //to clear
  console.log('result to update operation');
  console.log(result);
  if (result) {
    console.log("result after update password");
    console.log(result);
  }

  client.close();
  res.status(200).json({ message: "password updated!" });
}

export default handler;
