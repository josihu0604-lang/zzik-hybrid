import { PricingTable } from '@/components/vip/PricingTable';

export const metadata = {
  title: 'VIP Membership | ZZIK',
  description: 'Upgrade your K-Experience with ZZIK VIP tiers.',
};

export default function VipPage() {
  return (
    <div className="min-h-screen py-20 bg-space-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Unlock the Full <span className="text-transparent bg-clip-text bg-gradient-to-r from-flame-500 to-orange-400">K-Experience</span>
          </h1>
          <p className="text-xl text-slate-400">
            Join thousands of global fans enjoying exclusive benefits, priority access, and enhanced rewards.
          </p>
        </div>

        <PricingTable />
        
        <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Why Upgrade?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="p-6">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold text-white mb-2">Fast Track</h3>
                    <p className="text-slate-400">Skip the verification lines at popular popup stores.</p>
                </div>
                <div className="p-6">
                    <div className="text-4xl mb-4">💎</div>
                    <h3 className="text-xl font-bold text-white mb-2">Exclusive Merch</h3>
                    <p className="text-slate-400">Get access to limited edition digital and physical goods.</p>
                </div>
                <div className="p-6">
                    <div className="text-4xl mb-4">🌏</div>
                    <h3 className="text-xl font-bold text-white mb-2">Global Access</h3>
                    <p className="text-slate-400">Use your VIP status in Korea, Japan, and Thailand.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
