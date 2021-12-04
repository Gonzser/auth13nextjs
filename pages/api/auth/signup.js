import { connectToDatabase } from "../../../lib/db";
import { hashPassword } from "../../../lib/auth";

async function handler(req, res) {
  if (req.method !== "POST") {
    return;
  }

  const data = req.body;
  const { email, password } = data;

  if (
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 7
  ) {
    res.status(422).json({
      message: "invalid input not email@ || password must have at least 7 char long"
    });
    return;
  }

  const client = await connectToDatabase();
  const db = client.db();

  const existingUser = await db.collection("userDB").findOne({ email: email });

  if (existingUser) {
    res.status(422).json({ message: "The user already exists!" });
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(password);

  const result = await db.collection("userDB").insertOne({
    email: email,
    password: hashedPassword
  });
  console.log('new User register Result of ...');
  console.log(result);
  res.status(201).json({ message: "Created User!" });
}

export default handler;
