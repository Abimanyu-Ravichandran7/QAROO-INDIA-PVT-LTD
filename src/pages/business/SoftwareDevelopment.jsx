import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function SoftwareDevelopment() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('software-development')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'software-development')} />;
}
