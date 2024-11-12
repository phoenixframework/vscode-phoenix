import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
  // Register the definition provider for Elixir files
  const definitionProvider = vscode.languages.registerDefinitionProvider(
    { scheme: 'file', language: 'elixir' },
    new PhoenixComponentDefinitionProvider()
  );

  // Register the reference provider for Elixir files
  const referenceProvider = vscode.languages.registerReferenceProvider(
    { scheme: 'file', language: 'elixir' },
    new PhoenixComponentReferenceProvider()
  );

  context.subscriptions.push(definitionProvider, referenceProvider);
}

class PhoenixComponentDefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Definition | undefined> {
    const range = document.getWordRangeAtPosition(position, /<\.\w+/);
    if (!range) return;

    const tagText = document.getText(range);
    const tagMatch = tagText.match(/<\.(\w+)/)
    if(!tagMatch) return;

    const functionName = tagMatch[1];

    const functionRegex = new RegExp(`defp?\\s+${functionName}\\s*`);
    const privateMatch = functionRegex.exec(document.getText())
    if(privateMatch){
      const position = document.positionAt(privateMatch.index);
        return new vscode.Location(document.uri, position);
    }

    const files = await vscode.workspace.findFiles('lib/*_web/**/*.ex');
    console.log("Candidate .ex files", files)
    for (const file of files) {
      const fileContent = await vscode.workspace.openTextDocument(file);
      
      const match = functionRegex.exec(fileContent.getText());

      if (match) {
        const position = fileContent.positionAt(match.index);
        return new vscode.Location(file, position);
      }
    }
    return;
  }
}

class PhoenixComponentReferenceProvider implements vscode.ReferenceProvider {
  async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.ReferenceContext,
    token: vscode.CancellationToken
  ): Promise<vscode.Location[]> {
    const range = document.getWordRangeAtPosition(position, /<\.\w+\/>/);
    if (!range) return [];

    const tagText = document.getText(range);
    const match = tagText.match(/<\.(\w+)\s*\/>/);
    if (!match) return [];

    const functionName = match[1];
    const referencePattern = new RegExp(`<\\.${functionName}\\s*\\/?>`, 'g');

    const locations: vscode.Location[] = [];
    const files = await vscode.workspace.findFiles('**/*.heex', '**/deps/**');

    for (const file of files) {
      const fileContent = await vscode.workspace.openTextDocument(file);
      const text = fileContent.getText();
      let match;

      while ((match = referencePattern.exec(text)) !== null) {
        const position = fileContent.positionAt(match.index);
        locations.push(new vscode.Location(file, position));
      }
    }
    return locations;
  }
}

export function deactivate() {}