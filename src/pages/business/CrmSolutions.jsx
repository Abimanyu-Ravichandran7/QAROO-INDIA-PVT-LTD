import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function CrmSolutions() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('crm-solutions')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'crm-solutions')} />;
}
