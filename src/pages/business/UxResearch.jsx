import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function UxResearch() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('ux-research')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'ux-research')} />;
}
