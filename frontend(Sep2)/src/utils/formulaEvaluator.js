//frontend/src/utils/formulaEvaluator.js

import { Parser } from 'expr-eval';

class FormulaEvaluator {
  constructor() {
    this.parser = new Parser();
  }

  /**
   * Evaluate a formula with given variables
   * @param {string} formula - The formula to evaluate (e.g., "[Total Kgs]*([Rate / kg]/[Rate Per])")
   * @param {Object} variables - Object containing variable values
   * @returns {number} - Calculated result
   */
  evaluate(formula, variables) {
    if (!formula || formula.trim() === '') {
      return 0;
    }

    try {
      // Replace [VariableName] with actual variable values
      let processedFormula = formula;
      const variablePattern = /\[([^\]]+)\]/g;
      
      // Extract all variables from the formula
      const matches = formula.match(variablePattern) || [];
      
      matches.forEach(match => {
        const varName = match.slice(1, -1); // Remove brackets
        let value = this.getVariableValue(varName, variables);
        
        // Handle potential string values
        if (isNaN(value)) value = 0;
        
        // Replace the variable with its actual value
        const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        processedFormula = processedFormula.replace(
          new RegExp(escapedMatch, 'g'), 
          value.toString()
        );
      });

      // Evaluate the mathematical expression
      const result = this.parser.evaluate(processedFormula);
      return isNaN(result) ? 0 : parseFloat(result.toFixed(2));
    } catch (error) {
      console.error('Formula evaluation error:', error, formula, variables);
      return 0;
    }
  }

  /**
   * Get variable value from the variables object
   */
  getVariableValue(varName, variables) {
    // Handle special cases
    switch(varName) {
      case 'Total Kgs':
        return variables.totalKgs || 0;
      case 'Rate / kg':
        return variables.ratePerKg || 0;
      case 'Rate Per':
        return variables.ratePer || 1;
      case 'CharityRs':
        return variables.charityRs || 0;
      case 'ChessRs':
        return variables.chessRs || 0;
      case 'TCSRS':
        return variables.tcsRs || 0;
      case 'GstAmt':
        return variables.gstAmt || 0;
      case 'IGstAmt':
        return variables.igstAmt || 0;
      default:
        return variables[varName] || 0;
    }
  }

  /**
   * Calculate all fields in order based on their formulas
   * Uses multiple passes to resolve field dependencies (e.g., TCS depends on TCSRs which is calculated later)
   * @param {Array} fields - Array of field objects with formulas
   * @param {Object} baseVariables - Base variables (totalKgs, ratePerKg, etc.)
   * @returns {Object} - Calculated values mapped by fieldName and shortCode
   */
  calculateAllFields(fields, baseVariables) {
    const results = {};
    let variables = { ...baseVariables };

    // Sort fields by sequence
    const sortedFields = [...fields].sort((a, b) => a.sequence - b.sequence);

    // Multiple passes to resolve dependencies
    // Pass 1: Calculate all fields
    // Pass 2+: Recalculate fields using values from Pass 1 (resolves forward dependencies like TCS←TCSRs)
    const maxPasses = 3;
    
    for (let pass = 0; pass < maxPasses; pass++) {
      let hasChanges = false;
      const passResults = { ...results }; // Carry forward previous results

      sortedFields.forEach(field => {
        if (field.formula && field.formula.trim() !== '') {
          // Merge base variables, current results, and pass results
          const evalVariables = { ...baseVariables, ...results, ...passResults };
          
          // Calculate the value
          const newValue = this.evaluate(field.formula, evalVariables);
          const oldValue = passResults[field.fieldName] || 0;
          
          // Track if value changed
          if (Math.abs(newValue - oldValue) > 0.01) {
            hasChanges = true;
          }
          
          // Store result using both fieldName and shortCode as keys
          passResults[field.fieldName] = newValue;
          passResults[field.shortCode] = newValue;
        }
      });

      // Update variables with all calculated values for next iteration
      variables = { ...baseVariables, ...passResults };
      Object.assign(results, passResults);
      
      // If no significant changes, values have converged
      if (!hasChanges) {
        break;
      }
    }

    return results;
  }
}

export default new FormulaEvaluator();
