interface ParsedResume {
  skills: string[];
  projects: string[];
  education: string[];
}

export const parseResume = async (rawText: string): Promise<ParsedResume> => {
  return {
    skills: [],
    projects: [],
    education: [],
  };
};