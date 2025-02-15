import Layout from '@/components/Layout';

export default function Loading() {
  return (
    <Layout pathname="/campaigns">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg text-white">Loading campaigns...</div>
      </div>
    </Layout>
  );
}