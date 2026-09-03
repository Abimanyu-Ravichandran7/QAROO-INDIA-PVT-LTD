import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function DigitalMarketing() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('digital-marketing')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'digital-marketing')} />;
}
