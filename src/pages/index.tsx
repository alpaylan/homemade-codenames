import dynamic from 'next/dynamic'
 
const NoSSR = dynamic(() => import('../Game.tsx'), { ssr: false })
 
export default function Page() {
  return (
    <div>
      <NoSSR />
    </div>
  )
}
