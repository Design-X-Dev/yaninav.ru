export type ContactSerializedFormField =
  | {
      blockType: 'text' | 'email' | 'number';
      name: string;
      label?: string;
      required?: boolean;
      placeholder?: string;
      defaultValue?: string;
      inputType?: 'text' | 'email' | 'tel' | 'number';
    }
  | {
      blockType: 'textarea';
      name: string;
      label?: string;
      required?: boolean;
      placeholder?: string;
      defaultValue?: string;
    }
  | {
      blockType: 'checkbox';
      name: string;
      label?: string;
      required?: boolean;
      defaultValue?: boolean;
    }
  | {
      blockType: 'select';
      name: string;
      label?: string;
      required?: boolean;
      placeholder?: string;
      defaultValue?: string;
      options: { label: string; value: string }[];
    };

export type ContactSerializedForm = {
  id: string | number;
  submitButtonLabel: string;
  confirmationMessagePlain: string;
  fields: ContactSerializedFormField[];
};
