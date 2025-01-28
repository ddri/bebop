import Media from '@/components/Media';
import Layout from '@/components/Layout';

export default function MediaPage() {
  return (
    <Layout pathname="/media">
      <div className="container mx-auto p-8">
        <Media pathname="/media" />
      </div>
    </Layout>
  );
}