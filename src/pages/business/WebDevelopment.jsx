import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function WebDevelopment() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('web-development')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'web-development')} />;
}
