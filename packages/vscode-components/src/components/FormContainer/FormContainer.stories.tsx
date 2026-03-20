import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../Checkbox';
import { FormGroup } from '../FormGroup';
import { FormHelper } from '../FormHelper';
import { TextInput } from '../TextInput';
import { FormContainer } from './FormContainer';

const meta = {
  title: 'Form/FormContainer',
  component: FormContainer,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
} satisfies Meta<typeof FormContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [fontSize, setFontSize] = useState('14');
    const [lineHeight, setLineHeight] = useState('1.6');
    const invalid = Number(fontSize) < 6 || Number(fontSize) > 100;

    return (
      <FormContainer>
        <FormGroup
          label="Editor: Font Size"
          description="Controls the font size in pixels."
          helper={
            invalid ? (
              <FormHelper tone="error">
                The value must be an integer between 6 and 100.
              </FormHelper>
            ) : (
              'Minimum value is 6.'
            )
          }
          fill
        >
          <TextInput type="number" value={fontSize} onChange={setFontSize} />
        </FormGroup>
        <FormGroup
          label="Editor: Line Height"
          description="Controls the line height. Use 0 to compute it from the font size."
          helper={
            <FormHelper tone="info">
              A window reload is not required.
            </FormHelper>
          }
          fill
        >
          <TextInput
            type="number"
            value={lineHeight}
            onChange={setLineHeight}
          />
        </FormGroup>
        <FormGroup
          label="Files: Trim Trailing Whitespace"
          description="Remove trailing auto inserted whitespace."
          modified
        >
          <Checkbox toggle defaultChecked label="Enabled" />
        </FormGroup>
      </FormContainer>
    );
  },
};
