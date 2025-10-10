"use client";

import * as React from "react";
import * as FormPrimitive from "@radix-ui/react-form";
import { Slot } from "@radix-ui/react-slot";
import { Controller, type ControllerProps, type FieldPath, type FieldValues, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

const Form = FormProvider;

const FormFieldContext = React.createContext<{ name: string } | undefined>(undefined);

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    id: itemContext?.id,
    name: fieldContext.name,
    formItemId: `${itemContext?.id}-form-item`,
    formDescriptionId: `${itemContext?.id}-form-item-description`,
    formMessageId: `${itemContext?.id}-form-item-message`,
    ...fieldState,
  };
};

const FormItemContext = React.createContext<{ id: string } | undefined>(undefined);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<React.ElementRef<typeof FormPrimitive.Label>, React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>>(
  ({ className, ...props }, ref)
) => {
  const { error, formItemId } = useFormField();

  return (
    <FormPrimitive.Label
      ref={ref}
      className={cn(error ? "text-destructive" : "text-sm font-medium", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};
FormLabel.displayName = FormPrimitive.Label.displayName;

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();

  return <Slot ref={ref} id={formItemId} aria-describedby={`${formDescriptionId} ${formMessageId}`} {...props} />;
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={cn("text-xs text-muted-foreground", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <p ref={ref} id={formMessageId} className={cn("text-xs font-medium text-destructive", className)} {...props}>
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
