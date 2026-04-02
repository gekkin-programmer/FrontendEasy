export const GoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: jest.fn().mockReturnValue({
    generateContent: jest.fn().mockResolvedValue({
      response: { text: jest.fn().mockReturnValue('mocked variation') },
    }),
  }),
}));
