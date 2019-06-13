import { useI18n } from '../../i18n/react';
import * as React from 'react';
import { FormInput } from '../../dialog/components/parts';
import { FormWrapper, Label } from './elements';
import { useUniqueId } from '../../util/useUniqueId';

interface Props {
  /**
   * ref to userid input
   */
  userIdRef?: React.RefObject<HTMLInputElement>;
  /**
   * ref to password input
   */
  passwordRef?: React.RefObject<HTMLInputElement>;
}

/**
 * Show the main contents of login form.
 * @internal
 */
export const LoginFormContents = ({ userIdRef, passwordRef }: Props) => {
  const t = useI18n('common');
  const nameInputId = useUniqueId();
  const passwordInputId = useUniqueId();
  return (
    <FormWrapper>
      <Label htmlFor={nameInputId}>{t('loginForm.userid')}</Label>
      <span>
        <FormInput
          ref={userIdRef}
          id={nameInputId}
          autoComplete="username"
          required
        />
      </span>
      <Label htmlFor={passwordInputId}>{t('loginForm.password')}</Label>
      <span>
        <FormInput
          ref={passwordRef}
          id={passwordInputId}
          type="password"
          autoComplete="current-password"
          required
        />
      </span>
    </FormWrapper>
  );
};
