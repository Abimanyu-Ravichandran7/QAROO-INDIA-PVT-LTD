import BusinessSolutionTemplate from './BusinessSolutionTemplate.jsx';
import { BUSINESS_SOLUTIONS, getBusinessSolution } from '../../data/businessSolutions.js';

export default function GraphicDesignBranding() {
  return <BusinessSolutionTemplate solution={getBusinessSolution('graphic-design-branding')} otherSolutions={BUSINESS_SOLUTIONS.filter((s) => s.slug !== 'graphic-design-branding')} />;
}
