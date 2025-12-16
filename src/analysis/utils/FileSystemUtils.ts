/**
 * FileSystemUtils - Utilities for file system traversal and filtering
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileFilter {
  extensions?: string[];
  includePatterns?: RegExp[];
  excludePatterns?: RegExp[];
  maxDepth?: number;
  maxFileSize?: number; // in bytes
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  isDirectory: boolean;
  depth: number;
}

export class FileSystemUtils {
  /**
   * Traverse directory and return filtered file paths
   */
  static async traverseDirectory(
    rootPath: string, 
    filter: FileFilter = {}
  ): Promise<string[]> {
    const files: string[] = [];
    await this.traverseRecursive(rootPath, rootPath, files, filter, 0);
    return files;
  }

  /**
   * Get detailed file information for files in a directory
   */
  static async getFileInfos(
    rootPath: string,
    filter: FileFilter = {}
  ): Promise<FileInfo[]> {
    const fileInfos: FileInfo[] = [];
    await this.getFileInfosRecursive(rootPath, rootPath, fileInfos, filter, 0);
    return fileInfos;
  }

  /**
   * Check if a file matches the given filter criteria
   */
  static matchesFilter(filePath: string, fileName: string, filter: FileFilter): boolean {
    const extension = path.extname(fileName);

    // Check extensions
    if (filter.extensions && filter.extensions.length > 0) {
      if (!filter.extensions.includes(extension)) {
        return false;
      }
    }

    // Check include patterns
    if (filter.includePatterns && filter.includePatterns.length > 0) {
      const matches = filter.includePatterns.some(pattern => pattern.test(filePath));
      if (!matches) {
        return false;
      }
    }

    // Check exclude patterns
    if (filter.excludePatterns && filter.excludePatterns.length > 0) {
      const matches = filter.excludePatterns.some(pattern => pattern.test(filePath));
      if (matches) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get default filter for TypeScript/JavaScript source files
   */
  static getSourceFileFilter(): FileFilter {
    return {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      excludePatterns: [
        /node_modules/,
        /\.git/,
        /dist/,
        /build/,
        /\.next/,
        /coverage/,
        /\.nyc_output/,
        /\.vscode/,
        /\.idea/,
        /\.DS_Store/,
        /\.test\./,
        /\.spec\./,
        /\.d\.ts$/
      ],
      maxDepth: 10,
      maxFileSize: 1024 * 1024 // 1MB
    };
  }

  /**
   * Get filter for test files only
   */
  static getTestFileFilter(): FileFilter {
    return {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      includePatterns: [
        /\.test\./,
        /\.spec\./,
        /test/,
        /tests/,
        /__tests__/
      ],
      excludePatterns: [
        /node_modules/,
        /\.git/,
        /dist/,
        /build/
      ],
      maxDepth: 10,
      maxFileSize: 1024 * 1024 // 1MB
    };
  }

  /**
   * Check if a file exists and is readable
   */
  static async isReadableFile(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      const stats = await fs.stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Get file size in bytes
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Normalize file path for cross-platform compatibility
   */
  static normalizePath(filePath: string): string {
    return path.normalize(filePath).replace(/\\/g, '/');
  }

  /**
   * Get relative path from a base directory
   */
  static getRelativePath(basePath: string, targetPath: string): string {
    return this.normalizePath(path.relative(basePath, targetPath));
  }

  /**
   * Check if path is within allowed directories (security check)
   */
  static isPathSafe(basePath: string, targetPath: string): boolean {
    const resolvedBase = path.resolve(basePath);
    const resolvedTarget = path.resolve(targetPath);
    return resolvedTarget.startsWith(resolvedBase);
  }

  // Private helper methods

  private static async traverseRecursive(
    rootPath: string,
    currentPath: string,
    files: string[],
    filter: FileFilter,
    depth: number
  ): Promise<void> {
    // Check max depth
    if (filter.maxDepth !== undefined && depth > filter.maxDepth) {
      return;
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // Skip common directories that should be excluded
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }

          // Check if directory matches exclude patterns
          if (filter.excludePatterns) {
            const relativePath = this.getRelativePath(rootPath, fullPath);
            const shouldExclude = filter.excludePatterns.some(pattern => 
              pattern.test(relativePath) || pattern.test(entry.name)
            );
            if (shouldExclude) {
              continue;
            }
          }

          // Recursively traverse subdirectory
          await this.traverseRecursive(rootPath, fullPath, files, filter, depth + 1);
        } else if (entry.isFile()) {
          // Check file size if specified
          if (filter.maxFileSize) {
            const size = await this.getFileSize(fullPath);
            if (size > filter.maxFileSize) {
              continue;
            }
          }

          // Check if file matches filter
          const relativePath = this.getRelativePath(rootPath, fullPath);
          if (this.matchesFilter(relativePath, entry.name, filter)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${currentPath}:`, error);
    }
  }

  private static async getFileInfosRecursive(
    rootPath: string,
    currentPath: string,
    fileInfos: FileInfo[],
    filter: FileFilter,
    depth: number
  ): Promise<void> {
    // Check max depth
    if (filter.maxDepth !== undefined && depth > filter.maxDepth) {
      return;
    }

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          // Skip common directories that should be excluded
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }

          // Check if directory matches exclude patterns
          if (filter.excludePatterns) {
            const relativePath = this.getRelativePath(rootPath, fullPath);
            const shouldExclude = filter.excludePatterns.some(pattern => 
              pattern.test(relativePath) || pattern.test(entry.name)
            );
            if (shouldExclude) {
              continue;
            }
          }

          // Add directory info
          fileInfos.push({
            path: fullPath,
            name: entry.name,
            extension: '',
            size: 0,
            isDirectory: true,
            depth
          });

          // Recursively traverse subdirectory
          await this.getFileInfosRecursive(rootPath, fullPath, fileInfos, filter, depth + 1);
        } else if (entry.isFile()) {
          const size = await this.getFileSize(fullPath);

          // Check file size if specified
          if (filter.maxFileSize && size > filter.maxFileSize) {
            continue;
          }

          // Check if file matches filter
          const relativePath = this.getRelativePath(rootPath, fullPath);
          if (this.matchesFilter(relativePath, entry.name, filter)) {
            fileInfos.push({
              path: fullPath,
              name: entry.name,
              extension: path.extname(entry.name),
              size,
              isDirectory: false,
              depth
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${currentPath}:`, error);
    }
  }

  private static shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      'node_modules',
      '.git',
      '.svn',
      '.hg',
      'dist',
      'build',
      '.next',
      'coverage',
      '.nyc_output',
      '.vscode',
      '.idea',
      'tmp',
      'temp'
    ];

    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }
}