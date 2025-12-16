/**
 * CodeParser - Handles parsing TypeScript/JavaScript files using the TypeScript compiler API
 */

import * as ts from 'typescript';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ParsedFile {
  filePath: string;
  sourceFile: ts.SourceFile;
  content: string;
  metadata: FileMetadata;
}

export interface FileMetadata {
  classes: ClassInfo[];
  functions: FunctionInfo[];
  interfaces: InterfaceInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  linesOfCode: number;
}

export interface ClassInfo {
  name: string;
  startLine: number;
  endLine: number;
  methods: MethodInfo[];
  properties: PropertyInfo[];
}

export interface MethodInfo {
  name: string;
  startLine: number;
  endLine: number;
  parameters: ParameterInfo[];
  returnType?: string;
}

export interface FunctionInfo {
  name: string;
  startLine: number;
  endLine: number;
  parameters: ParameterInfo[];
  returnType?: string;
}

export interface ParameterInfo {
  name: string;
  type?: string;
}

export interface PropertyInfo {
  name: string;
  type?: string;
  startLine: number;
}

export interface InterfaceInfo {
  name: string;
  startLine: number;
  endLine: number;
  properties: PropertyInfo[];
}

export interface ImportInfo {
  module: string;
  imports: string[];
  startLine: number;
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'class' | 'interface' | 'variable';
  startLine: number;
}

export class CodeParser {
  private compilerOptions: ts.CompilerOptions;

  constructor() {
    this.compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      allowJs: true,
      declaration: false,
      outDir: undefined,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    };
  }

  /**
   * Parse a single TypeScript/JavaScript file
   */
  async parseFile(filePath: string): Promise<ParsedFile> {
    const content = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.ES2020,
      true
    );

    const metadata = this.extractMetadata(sourceFile, content);

    return {
      filePath,
      sourceFile,
      content,
      metadata
    };
  }

  /**
   * Parse multiple files in a directory
   */
  async parseDirectory(dirPath: string, extensions: string[] = ['.ts', '.tsx', '.js', '.jsx']): Promise<ParsedFile[]> {
    const files = await this.getSourceFiles(dirPath, extensions);
    const parsedFiles: ParsedFile[] = [];

    for (const filePath of files) {
      try {
        const parsed = await this.parseFile(filePath);
        parsedFiles.push(parsed);
      } catch (error) {
        console.warn(`Failed to parse file ${filePath}:`, error);
      }
    }

    return parsedFiles;
  }

  /**
   * Get all source files in a directory recursively
   */
  private async getSourceFiles(dirPath: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
            const subFiles = await this.getSourceFiles(fullPath, extensions);
            files.push(...subFiles);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${dirPath}:`, error);
    }

    return files;
  }

  /**
   * Extract metadata from a TypeScript source file
   */
  private extractMetadata(sourceFile: ts.SourceFile, content: string): FileMetadata {
    const metadata: FileMetadata = {
      classes: [],
      functions: [],
      interfaces: [],
      imports: [],
      exports: [],
      linesOfCode: content.split('\n').length
    };

    const visit = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          this.extractClassInfo(node as ts.ClassDeclaration, sourceFile, metadata);
          break;
        case ts.SyntaxKind.FunctionDeclaration:
          this.extractFunctionInfo(node as ts.FunctionDeclaration, sourceFile, metadata);
          break;
        case ts.SyntaxKind.InterfaceDeclaration:
          this.extractInterfaceInfo(node as ts.InterfaceDeclaration, sourceFile, metadata);
          break;
        case ts.SyntaxKind.ImportDeclaration:
          this.extractImportInfo(node as ts.ImportDeclaration, sourceFile, metadata);
          break;
        case ts.SyntaxKind.ExportDeclaration:
        case ts.SyntaxKind.ExportAssignment:
          this.extractExportInfo(node, sourceFile, metadata);
          break;
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return metadata;
  }

  private extractClassInfo(node: ts.ClassDeclaration, sourceFile: ts.SourceFile, metadata: FileMetadata): void {
    if (!node.name) return;

    const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;

    const classInfo: ClassInfo = {
      name: node.name.text,
      startLine,
      endLine,
      methods: [],
      properties: []
    };

    // Extract methods and properties
    node.members.forEach(member => {
      if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        const methodStartLine = sourceFile.getLineAndCharacterOfPosition(member.getStart()).line + 1;
        const methodEndLine = sourceFile.getLineAndCharacterOfPosition(member.getEnd()).line + 1;
        
        classInfo.methods.push({
          name: member.name.text,
          startLine: methodStartLine,
          endLine: methodEndLine,
          parameters: this.extractParameters(member.parameters),
          returnType: member.type ? member.type.getText() : undefined
        });
      } else if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        const propStartLine = sourceFile.getLineAndCharacterOfPosition(member.getStart()).line + 1;
        
        classInfo.properties.push({
          name: member.name.text,
          type: member.type ? member.type.getText() : undefined,
          startLine: propStartLine
        });
      }
    });

    metadata.classes.push(classInfo);
  }

  private extractFunctionInfo(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile, metadata: FileMetadata): void {
    if (!node.name) return;

    const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;

    metadata.functions.push({
      name: node.name.text,
      startLine,
      endLine,
      parameters: this.extractParameters(node.parameters),
      returnType: node.type ? node.type.getText() : undefined
    });
  }

  private extractInterfaceInfo(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile, metadata: FileMetadata): void {
    const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;

    const interfaceInfo: InterfaceInfo = {
      name: node.name.text,
      startLine,
      endLine,
      properties: []
    };

    node.members.forEach(member => {
      if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
        const propStartLine = sourceFile.getLineAndCharacterOfPosition(member.getStart()).line + 1;
        
        interfaceInfo.properties.push({
          name: member.name.text,
          type: member.type ? member.type.getText() : undefined,
          startLine: propStartLine
        });
      }
    });

    metadata.interfaces.push(interfaceInfo);
  }

  private extractImportInfo(node: ts.ImportDeclaration, sourceFile: ts.SourceFile, metadata: FileMetadata): void {
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) return;

    const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const module = node.moduleSpecifier.text;
    const imports: string[] = [];

    if (node.importClause) {
      if (node.importClause.name) {
        imports.push(node.importClause.name.text);
      }
      if (node.importClause.namedBindings) {
        if (ts.isNamedImports(node.importClause.namedBindings)) {
          node.importClause.namedBindings.elements.forEach(element => {
            imports.push(element.name.text);
          });
        }
      }
    }

    metadata.imports.push({
      module,
      imports,
      startLine
    });
  }

  private extractExportInfo(node: ts.Node, sourceFile: ts.SourceFile, metadata: FileMetadata): void {
    const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    
    // This is a simplified extraction - could be expanded for more complex export patterns
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      node.exportClause.elements.forEach(element => {
        metadata.exports.push({
          name: element.name.text,
          type: 'variable', // Default type
          startLine
        });
      });
    }
  }

  private extractParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>): ParameterInfo[] {
    return parameters.map(param => ({
      name: param.name.getText(),
      type: param.type ? param.type.getText() : undefined
    }));
  }
}