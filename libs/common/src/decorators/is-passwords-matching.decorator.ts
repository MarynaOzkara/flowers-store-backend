import { RegisterDto } from "@auth/dto";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";



@ValidatorConstraint({name: 'IsPasswordsMatching', async: false})
export class IsPasswordsMatchingConstraint implements ValidatorConstraintInterface {
    validate(passwordRepeat: string, args: ValidationArguments): Promise<boolean> | boolean {
       const obj = args.object as RegisterDto
       return obj.password === passwordRepeat   
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    defaultMessage(args?: ValidationArguments): string {
        return 'Passwords not matche'
    }
    
}