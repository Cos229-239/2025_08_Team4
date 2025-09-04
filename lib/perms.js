
import { Permission, Role } from "react-native-appwrite";

export const ownerPerms = (userId) => [
  Permission.read(Role.user(userId)),
  Permission.write(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];
