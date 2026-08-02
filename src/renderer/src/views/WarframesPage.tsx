import ItemGrid from '../components/ItemGrid'
import { WARFRAME_CATEGORIES } from '../constants'
import { useT } from '../i18n/useT'

function WarframesPage(): React.JSX.Element {
  const t = useT()
  return <ItemGrid title={t('sidebar.nav.warframes')} categoryScope={WARFRAME_CATEGORIES} />
}

export default WarframesPage
