import { TokensType } from "./tokens.type"
import { UserType } from "./user.type"

export type UserResponseType = {
    user: UserType
    token: TokensType
}