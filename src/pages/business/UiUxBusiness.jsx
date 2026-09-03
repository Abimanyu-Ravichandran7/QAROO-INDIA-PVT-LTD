import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function UiUxBusiness() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('ui-ux-design')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'ui-ux-design')} />;
}
