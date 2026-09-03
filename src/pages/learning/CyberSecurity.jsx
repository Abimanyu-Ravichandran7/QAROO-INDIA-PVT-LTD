import ProgramTemplate from './ProgramTemplate.jsx';
import { PROGRAMS, getProgram } from '../../data/programs.js';

export default function CyberSecurity() {
  return <ProgramTemplate program={getProgram('cyber-security-ethical-hacking')} otherPrograms={PROGRAMS.filter((p) => p.slug !== 'cyber-security-ethical-hacking')} />;
}
