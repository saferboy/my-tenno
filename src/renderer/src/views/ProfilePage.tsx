import { useEffect } from 'react'
import { Award, Coins, Gem } from 'lucide-react'
import { useUserProfileStore } from '../store/useUserProfileStore'
import { useT } from '../i18n/useT'
import Panel from '../components/Panel'
import EditableNumber from '../components/EditableNumber'

// TopNav'ning eski Sidebar-footer profil vidjetini almashtiradi - endi
// alohida sahifa, Mastery Rank'ga qo'shimcha Credits/Platinum ham shu yerda.
function ProfilePage(): React.JSX.Element {
  const masteryRank = useUserProfileStore((s) => s.masteryRank)
  const credits = useUserProfileStore((s) => s.credits)
  const platinum = useUserProfileStore((s) => s.platinum)
  const setMasteryRank = useUserProfileStore((s) => s.setMasteryRank)
  const setCredits = useUserProfileStore((s) => s.setCredits)
  const setPlatinum = useUserProfileStore((s) => s.setPlatinum)
  const initProfile = useUserProfileStore((s) => s.init)
  const t = useT()

  useEffect(() => {
    initProfile()
  }, [initProfile])

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <div className="flex items-center gap-3">
        <div className="rank-badge flex h-12 w-12 shrink-0 items-center justify-center rounded-md font-mono text-base font-bold text-white">
          {masteryRank}
        </div>
        <div>
          <h1 className="font-display text-xl font-extrabold tracking-wide text-[var(--color-tenno-gold)] uppercase">
            {t('sidebar.profile.name')}
          </h1>
          <p className="font-mono text-xs text-[var(--color-t3)]">
            {t('sidebar.profile.masteryRank', { rank: masteryRank })}
          </p>
        </div>
      </div>

      <div className="grid max-w-md gap-4 sm:grid-cols-3">
        <Panel title={t('profile.masteryRankLabel')} icon={Award}>
          <EditableNumber
            value={masteryRank}
            onCommit={setMasteryRank}
            className="font-display text-2xl font-extrabold text-[var(--color-t1)] hover:text-[var(--color-tenno-cyan)]"
          />
        </Panel>
        <Panel title={t('profile.credits')} icon={Coins}>
          <EditableNumber
            value={credits}
            onCommit={setCredits}
            format={(v) => v.toLocaleString()}
            className="font-display text-2xl font-extrabold text-[var(--color-t1)] hover:text-[var(--color-tenno-cyan)]"
          />
        </Panel>
        <Panel title={t('profile.platinum')} icon={Gem} tone="gold">
          <EditableNumber
            value={platinum}
            onCommit={setPlatinum}
            format={(v) => v.toLocaleString()}
            className="font-display text-2xl font-extrabold text-[var(--color-t1)] hover:text-[var(--color-tenno-gold)]"
          />
        </Panel>
      </div>
    </div>
  )
}

export default ProfilePage
