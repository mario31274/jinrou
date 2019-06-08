import { useI18n } from '../../i18n/react';
import * as React from 'react';
import {
  FormTable,
  FormInput,
  FormErrorMessage,
} from '../../dialog/components/parts';

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
  return (
    <FormTable>
      <tbody>
        <tr>
          <th>{t('loginForm.userid')}</th>
          <td>
            <FormInput ref={userIdRef} autoComplete="username" required />
          </td>
        </tr>
        <tr>
          <th>{t('loginForm.password')}</th>
          <td>
            <FormInput
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              required
            />
          </td>
        </tr>
      </tbody>
    </FormTable>
  );
};