import { promises as fs } from 'fs';
import path from 'path';
import type { ReadmeContent } from '../models/types.js';
import { PersistenceError, PersistenceErrorCode } from '../models/types.js';

/**
 * Service for parsing README.md file and extracting content for the Learn About popup
 */
export class ReadmeParser {
  private static readonly README_PATH = path.join(process.cwd(), 'README.md');

  /**
   * Parse the README.md file and extract the first three sections
   * @returns Promise<ReadmeContent> The parsed content
   * @throws PersistenceError if file cannot be read or parsed
   */
  public static async parseReadmeFile(): Promise<ReadmeContent> {
    try {
      const content = await fs.readFile(this.README_PATH, 'utf-8');
      return this.extractSections(content);
    } catch (error) {
      if (error instanceof Error) {
        if ('code' in error && error.code === 'ENOENT') {
          throw new PersistenceError(
            'README.md file not found',
            PersistenceErrorCode.FILE_READ_ERROR,
            { path: this.README_PATH }
          );
        }
        if ('code' in error && error.code === 'EACCES') {
          throw new PersistenceError(
            'Permission denied reading README.md',
            PersistenceErrorCode.PERMISSION_ERROR,
            { path: this.README_PATH }
          );
        }
      }
      throw new PersistenceError(
        'Failed to read README.md file',
        PersistenceErrorCode.FILE_READ_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Extract the first three sections from README content
   * @param content The raw README.md content
   * @returns ReadmeContent The extracted and parsed content
   */
  public static extractSections(content: string): ReadmeContent {
    try {
      const lines = content.split('\n');
      let title = '';
      let version = '';
      let description = '';
      const features: string[] = [];
      const gameRules: string[] = [];
      const recentUpdates: string[] = [];

      let currentSection = '';
      let inFeatures = false;
      let inGameRules = false;
      let inRecentUpdates = false;
      let foundFirstSection = false;

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Extract title (first # heading)
        if (trimmedLine.startsWith('# ') && !title) {
          title = trimmedLine.substring(2).trim();
          continue;
        }

        // Extract version (look for **Version X.X.X** pattern) - only capture the first one
        if (trimmedLine.startsWith('**Version ') && !version) {
          const versionMatch = trimmedLine.match(/\*\*Version ([^*]+)\*\*/);
          if (versionMatch) {
            version = 'Version ' + versionMatch[1];
            continue;
          }
        }

        // Check for section headers
        if (trimmedLine.startsWith('## ')) {
          currentSection = trimmedLine.substring(3).trim();
          inFeatures = currentSection === 'Features';
          inGameRules = currentSection === 'Game Rules Implemented';
          inRecentUpdates = currentSection === 'Recent Updates';
          foundFirstSection = true;
          
          // Stop processing after we've found all required sections
          // Continue until we find Recent Updates or reach the License section
          if (currentSection === 'License') {
            break;
          }
          continue;
        }

        // Extract description paragraph (after version, before first section)
        if (!foundFirstSection && title && version && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
          // Capture the description paragraph
          if (!description) {
            description = trimmedLine;
          } else {
            // If there are multiple paragraphs, join them with a space
            description += ' ' + trimmedLine;
          }
        }

        // Extract bullet points from Features section (handle subsections and various bullet formats)
        if (inFeatures) {
          // Handle subsection headers (### headers) - extract as feature categories
          if (trimmedLine.startsWith('### ')) {
            const subsectionTitle = trimmedLine.substring(4).trim();
            features.push(subsectionTitle);
          }
          // Handle bullet points with various formats
          else if (trimmedLine.startsWith('- **') || trimmedLine.startsWith('- ')) {
            const feature = this.extractBulletPoint(trimmedLine);
            if (feature) {
              features.push(feature);
            }
          }
        }

        // Extract bullet points from Game Rules section
        if (inGameRules && trimmedLine.startsWith('- ')) {
          const rule = this.extractBulletPoint(trimmedLine);
          if (rule) {
            gameRules.push(rule);
          }
        }

        // Extract content from Recent Updates section
        if (inRecentUpdates && trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
          // Skip empty lines and sub-headers, but include descriptive text
          if (trimmedLine.startsWith('- ')) {
            const update = this.extractBulletPoint(trimmedLine);
            if (update) {
              recentUpdates.push(update);
            }
          } else if (!trimmedLine.startsWith('###') && trimmedLine !== 'See [CHANGELOG.md](CHANGELOG.md) for complete version history.') {
            // Include descriptive paragraphs but skip sub-headers and changelog reference
            recentUpdates.push(trimmedLine);
          }
        }
      }

      // Validate that we extracted the required content
      if (!title) {
        throw new Error('Could not extract title from README');
      }
      if (!version) {
        throw new Error('Could not extract version from README');
      }
      if (!description) {
        throw new Error('Could not extract description from README');
      }
      if (features.length === 0) {
        throw new Error('Could not extract features from README');
      }
      if (gameRules.length === 0) {
        throw new Error('Could not extract game rules from README');
      }
      // Note: recentUpdates is optional - some READMEs might not have this section

      return {
        title,
        version,
        description,
        features,
        gameRules,
        recentUpdates,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new PersistenceError(
        'Failed to parse README content',
        PersistenceErrorCode.JSON_PARSE_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * Extract clean text from a markdown bullet point
   * @param line The markdown line to process
   * @returns The cleaned text or null if invalid
   */
  private static extractBulletPoint(line: string): string | null {
    // Remove the bullet point marker
    let text = line.substring(line.indexOf('- ') + 2).trim();
    
    if (!text) {
      return null;
    }

    // Handle bold formatting: **Text:** Description -> Text: Description
    if (text.startsWith('**')) {
      const boldEnd = text.indexOf('**', 2);
      if (boldEnd !== -1) {
        const boldText = text.substring(2, boldEnd);
        const remainder = text.substring(boldEnd + 2).trim();
        // Clean up the colon if it exists
        const cleanRemainder = remainder.startsWith(':') ? remainder.substring(1).trim() : remainder;
        text = boldText + (cleanRemainder ? ': ' + cleanRemainder : '');
      }
    }

    return text;
  }
}