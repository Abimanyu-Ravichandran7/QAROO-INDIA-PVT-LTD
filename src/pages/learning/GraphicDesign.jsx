import ProgramTemplate from './ProgramTemplate.jsx';
import { PROGRAMS, getProgram } from '../../data/programs.js';

export default function GraphicDesign() {
  return <ProgramTemplate program={getProgram('graphic-design-animation')} otherPrograms={PROGRAMS.filter((p) => p.slug !== 'graphic-design-animation')} />;
}
