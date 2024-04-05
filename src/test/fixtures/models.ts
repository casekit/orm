import { post } from "./models/post.model";
import { user } from "./models/user.model";

export const models = {
    post,
    user,
};

export type Models = typeof models;
