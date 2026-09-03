import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function BusinessStrategy() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('business-strategy')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'business-strategy')} />;
}
