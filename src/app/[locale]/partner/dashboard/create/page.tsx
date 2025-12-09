import { Metadata } from 'next';
import CreateExperienceClient from './CreateExperienceClient';

export const metadata: Metadata = {
  title: 'Create Experience | ZZIK Partner',
  description: 'Create a new K-Experience.',
};

export default function CreateExperiencePage() {
  return <CreateExperienceClient />;
}
