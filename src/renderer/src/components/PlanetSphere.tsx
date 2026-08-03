interface PlanetSphereProps {
  palette: [hi: string, mid: string, lo: string]
  size: number
}

// Star Chart sidebar qatorlaridagi 36px CSS planeta sferasi - qatlamli
// radial/linear gradient texnikasi (design handoff maketidan).
function PlanetSphere({ palette, size }: PlanetSphereProps): React.JSX.Element {
  const [hi, mid, lo] = palette

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: [
          'linear-gradient(135deg, rgba(255,255,255,.22) 0%, transparent 40%, rgba(0,0,0,.72) 100%)',
          `radial-gradient(circle at 62% 68%, ${lo} 0 8%, transparent 9%)`,
          `radial-gradient(ellipse 40% 22% at 30% 55%, ${hi}55 0 60%, transparent 70%)`,
          `radial-gradient(ellipse 55% 30% at 68% 38%, ${mid}88 0 55%, transparent 68%)`,
          `radial-gradient(circle at 35% 30%, ${hi}, ${mid} 48%, ${lo} 85%)`
        ].join(','),
        boxShadow:
          'inset -6px -6px 12px rgba(0,0,0,.75), inset 3px 3px 6px rgba(255,255,255,.18), inset 0 0 4px rgba(255,255,255,.08)'
      }}
    />
  )
}

export default PlanetSphere
