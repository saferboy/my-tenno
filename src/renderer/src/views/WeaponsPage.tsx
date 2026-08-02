import ItemGrid from '../components/ItemGrid'
import { WEAPONS_PAGE_CATEGORIES } from '../constants'
import { useT } from '../i18n/useT'

function WeaponsPage(): React.JSX.Element {
  const t = useT()
  return <ItemGrid title={t('sidebar.nav.weapons')} categoryScope={WEAPONS_PAGE_CATEGORIES} />
}

export default WeaponsPage
