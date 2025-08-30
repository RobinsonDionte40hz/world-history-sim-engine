# Text Templating Troubleshooting Guide

## Quick Reference

### Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Unclosed conditional statement" | Missing `{{/if}}` tag | Add closing `{{/if}}` for every `{{#if}}` |
| "Incomplete placeholder syntax" | Missing closing `}}` | Complete all placeholders with `}}` |
| "Invalid property path" | Placeholder refers to non-existent data | Check available properties in suggestions |
| "Syntax error in conditional" | Invalid condition logic | Review conditional syntax examples |

### Syntax Quick Check

```
✅ Correct Syntax:
{{character.name}}
{{#if character.reputation > 10}}text{{/if}}
{{random:option1,option2,option3}}

❌ Incorrect Syntax:
{{character.name
{{#if character.reputation > 10}}text
{{random:option1,option2,option3
```

## Detailed Troubleshooting

### 1. Placeholder Issues

#### Problem: Placeholder not resolving
**Symptoms**: Yellow highlighting in preview, placeholder shows as literal text

**Causes & Solutions**:
- **Missing data**: Character/node doesn't have the requested property
  - *Solution*: Check contextual suggestions for available properties
- **Incorrect property path**: Typo in placeholder name
  - *Solution*: Use suggestions panel to insert correct placeholders
- **Context not available**: Trying to use character data when no character is present
  - *Solution*: Verify the editor has the required context

**Example**:
```
❌ Problem: {{character.nonexistent}} 
✅ Solution: {{character.name}}

❌ Problem: {{character.atributes.strength}} (typo)
✅ Solution: {{character.attributes.strength}}
```

#### Problem: Placeholder syntax error
**Symptoms**: Red highlighting, error message in preview

**Common Issues**:
```
❌ Missing closing braces: {{character.name
✅ Correct: {{character.name}}

❌ Extra spaces: {{ character.name }}
✅ Correct: {{character.name}}

❌ Wrong braces: {character.name}
✅ Correct: {{character.name}}
```

### 2. Conditional Logic Issues

#### Problem: Conditional not working
**Symptoms**: Text always shows or never shows regardless of condition

**Debugging Steps**:
1. **Check condition syntax**:
   ```
   ❌ Wrong: {{#if character.reputation = 10}}
   ✅ Correct: {{#if character.reputation == 10}}
   
   ❌ Wrong: {{#if character.reputation > 10 and character.name == "Elena"}}
   ✅ Correct: {{#if character.reputation > 10 AND character.name == "Elena"}}
   ```

2. **Verify data types**:
   ```
   ❌ Wrong: {{#if character.name > 10}} (comparing string to number)
   ✅ Correct: {{#if character.reputation > 10}} (comparing numbers)
   ```

3. **Check property existence**:
   ```
   ❌ Risky: {{#if character.reputation > 10}} (if reputation is undefined)
   ✅ Safer: {{#if character.reputation AND character.reputation > 10}}
   ```

#### Problem: Unclosed conditionals
**Symptoms**: "Unclosed conditional statement" error

**Solution**: Every `{{#if}}` needs a matching `{{/if}}`
```
❌ Wrong:
{{#if character.reputation > 10}}
Welcome back!
{{#if character.attributes.charisma > 14}}
Your charm is evident.

✅ Correct:
{{#if character.reputation > 10}}
Welcome back!
{{#if character.attributes.charisma > 14}}
Your charm is evident.
{{/if}}
{{/if}}
```

#### Problem: Nested conditional confusion
**Symptoms**: Unexpected text showing or hiding

**Debugging Strategy**:
1. **Start simple**: Test each condition individually
2. **Add nesting gradually**: Build complexity step by step
3. **Use indentation**: Make structure clear

```
✅ Clear structure:
{{#if character.type == "merchant"}}
  {{#if character.reputation > 15}}
    Honored merchant {{character.name}}!
  {{#else}}
    Greetings, trader.
  {{/if}}
{{#else}}
  {{#if character.reputation > 15}}
    Welcome, esteemed {{character.name}}!
  {{#else}}
    Hello there.
  {{/if}}
{{/if}}
```

### 3. Random Selection Issues

#### Problem: Random selection not working
**Symptoms**: Literal text showing instead of random selection

**Common Issues**:
```
❌ Wrong syntax: {{random option1,option2,option3}}
✅ Correct: {{random:option1,option2,option3}}

❌ Spaces around colon: {{random : option1,option2}}
✅ Correct: {{random:option1,option2}}

❌ Missing options: {{random:}}
✅ Correct: {{random:option1,option2}}
```

#### Problem: Random selection in conditionals
**Symptoms**: Random selection not working inside if statements

**Solution**: Ensure proper nesting
```
✅ Correct:
{{#if character.reputation > 10}}
{{random:Welcome back,Good to see you}}, {{character.name}}!
{{/if}}
```

### 4. Performance Issues

#### Problem: Slow preview updates
**Symptoms**: Lag when typing, delayed preview refresh

**Solutions**:
1. **Simplify complex templates**: Reduce nested conditionals
2. **Break up large templates**: Split into smaller sections
3. **Avoid deep property chains**: Use shorter paths when possible

#### Problem: Editor becomes unresponsive
**Symptoms**: UI freezes, typing becomes slow

**Emergency Solutions**:
1. **Clear the text field**: Remove all content and start over
2. **Refresh the page**: Reload to reset state
3. **Check for infinite loops**: Look for circular conditional logic

### 5. Context and Data Issues

#### Problem: No suggestions appearing
**Symptoms**: Empty suggestions panel

**Causes & Solutions**:
- **No context available**: Editor doesn't have character/node data
  - *Solution*: Ensure you're editing within proper context (character selected, node active)
- **Context not loaded**: Data hasn't finished loading
  - *Solution*: Wait for data to load, refresh if necessary

#### Problem: Wrong suggestions showing
**Symptoms**: Suggestions don't match current context

**Solutions**:
1. **Verify context**: Check that correct character/node is selected
2. **Refresh context**: Navigate away and back to refresh data
3. **Check data integrity**: Ensure character/node data is complete

### 6. Preview Issues

#### Problem: Preview not updating
**Symptoms**: Preview shows old content or doesn't change

**Solutions**:
1. **Wait for debounce**: Preview updates after you stop typing (300ms delay)
2. **Check for errors**: Red highlighting prevents preview updates
3. **Refresh editor**: Close and reopen the editor

#### Problem: Preview shows different text than expected
**Symptoms**: Preview doesn't match what you think the template should produce

**Debugging Steps**:
1. **Check actual data values**: Verify character.reputation, node.name, etc.
2. **Test conditions step by step**: Isolate each conditional
3. **Use simple placeholders**: Start with `{{character.name}}` to verify context

### 7. Integration Issues

#### Problem: Templates not working in saved content
**Symptoms**: Templates work in editor but not in saved interactions/encounters

**Solutions**:
1. **Verify save process**: Ensure templates are saved with placeholder syntax
2. **Check resolution context**: Verify data is available when content is displayed
3. **Test with simple templates**: Start with basic placeholders

#### Problem: Templates breaking existing content
**Symptoms**: Previously working content now shows errors

**Solutions**:
1. **Check for syntax conflicts**: Ensure existing `{{}}` text is properly escaped
2. **Verify data compatibility**: Ensure referenced properties still exist
3. **Use migration approach**: Update content gradually

## Debugging Workflow

### Step-by-Step Debugging

1. **Identify the Issue**
   - What's the error message?
   - What's highlighted in red/yellow?
   - What behavior are you seeing vs. expecting?

2. **Isolate the Problem**
   - Remove complex parts temporarily
   - Test with simple placeholders first
   - Add complexity back gradually

3. **Check the Basics**
   - Are all `{{}}` properly closed?
   - Are all `{{#if}}` statements closed with `{{/if}}`?
   - Are property names spelled correctly?

4. **Verify Context**
   - Is the required data available?
   - Are you in the right editor context?
   - Do the suggestions show expected properties?

5. **Test Incrementally**
   - Start with working simple template
   - Add one feature at a time
   - Test after each addition

### Common Debugging Templates

Use these simple templates to test basic functionality:

```
# Test basic character context
{{character.name}}

# Test basic node context  
{{node.name}}

# Test simple conditional
{{#if character.reputation}}Has reputation{{/if}}

# Test random selection
{{random:option1,option2}}
```

## Prevention Tips

### Writing Robust Templates

1. **Always test with preview**: Don't assume templates work without testing
2. **Start simple**: Build complexity gradually
3. **Use consistent patterns**: Develop standard approaches for common scenarios
4. **Document complex templates**: Add comments explaining complex logic
5. **Validate data availability**: Use conditionals to check for data existence

### Code Review Checklist

Before finalizing templates:
- [ ] All placeholders properly closed with `}}`
- [ ] All conditionals have matching `{{/if}}`
- [ ] Property names match available data
- [ ] Conditions use correct operators (`==`, `>`, `AND`, `OR`)
- [ ] Random selections have proper syntax `{{random:}}`
- [ ] Preview shows expected output
- [ ] Template works with different character/node data

## Getting Additional Help

### Resources
1. **Text Templating Guide**: Complete feature documentation
2. **Contextual Suggestions**: Use the suggestions panel for valid placeholders
3. **Preview System**: Real-time feedback on template correctness

### Community Support
- Check existing templates for patterns and examples
- Share problematic templates for community debugging
- Contribute working templates to help others

### Reporting Issues
If you encounter bugs or unexpected behavior:
1. Note the exact error message
2. Provide the template text that causes the issue
3. Describe the expected vs. actual behavior
4. Include information about the character/node context

Remember: Most templating issues are syntax-related and can be resolved by carefully checking placeholder syntax and conditional logic. When in doubt, start simple and build complexity gradually.