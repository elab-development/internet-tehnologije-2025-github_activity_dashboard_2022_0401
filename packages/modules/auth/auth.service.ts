import bcrypt from "bcrypt";
import { dataSource } from "../../database/data-src";
import { User } from "../../entities/user-entity";
import { Role } from "../../entities/role-entity";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.config";

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export const registerUser = async (data: RegisterInput): Promise<User> => {
  const { email, username, password } = data;

  if (!email || !username || !password) {
    throw new Error("All fields are required");
  }

  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const existingUser = await userRepo.findOne({
    where: [{ email }, { username }],
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const userRole = await roleRepo.findOne({
    where: { name: "user" },
  });

  if (!userRole) {
    throw new Error("User role not found");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = userRepo.create({
    email,
    username,
    password: hashedPassword,
    role: userRole,
  });

  const savedUser = await userRepo.save(user);

  return savedUser;
};


interface LoginInput {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginInput) => {
    const {email,password} = data

  const userRepo = dataSource.getRepository(User);

  const user = await userRepo.findOne({
    where: { email },
    relations: ["role"],
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }


  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Wrong password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role.name,
    },
    jwtConfig.secret,
    
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role.name,
    },
  };
};
