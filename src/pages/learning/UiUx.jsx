import ProgramTemplate from './ProgramTemplate.jsx';
import { PROGRAMS, getProgram } from '../../data/programs.js';

export default function UiUx() {
  return <ProgramTemplate program={getProgram('ui-ux-design')} otherPrograms={PROGRAMS.filter((p) => p.slug !== 'ui-ux-design')} />;
}
