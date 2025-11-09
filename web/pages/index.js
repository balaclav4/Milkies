import Head from 'next/head'
import MilkSupplyTracker from '../components/MilkSupplyTracker'

export default function Home() {
  return (
    <>
      <Head>
        <title>Milkies - Breastfeeding & Pumping Tracker</title>
        <meta name="description" content="Track your breastfeeding and pumping journey" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <MilkSupplyTracker />
      </main>
    </>
  )
}
