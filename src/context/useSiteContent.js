import { useContext } from 'react';
import { SiteContentContext } from './SiteContentContextValue';

export function useSiteContent() {
  return useContext(SiteContentContext);
}
