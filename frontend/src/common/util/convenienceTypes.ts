export type AsJSON<InputType> = InputType extends Date
    ? number
    : {
          [Key in keyof InputType]: InputType[Key] extends Date ? number : AsJSON<InputType[Key]>;
      };
