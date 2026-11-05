
---

## Getting started

### Prerequisites
- Node.js 18 or later
- npm
- A Google Gemini API key

### Installation

```bash
git clone https://github.com/<your-username>/biznespanel.git
cd biznespanel
npm install
```

### Environment variables

Create a `.env.local` file in the project root. Do not commit this file.

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Add any other variables your Firebase configuration requires.

### Run locally

```bash
npm run dev
```

Then open `http://localhost:3000` (or the port shown in your terminal).

---

## Security

- The Gemini API key is used only on the server and is never exposed to frontend code.
- Uploaded files are validated by type and size before processing.
- Inputs are validated on both client and server.
- Each user's data should be isolated. Firestore security rules must restrict access to the owner only.
- Destructive actions (deleting imported data, clearing demo data) require confirmation.

Please do not upload real customer or financial data to publicly hosted demo instances.

---

## Current limitations

- This is an MVP and is not a full accounting or ERP system.
- Not included: payroll, inventory workflows, CRM features, banking integrations, live 1C / Logo / Mikro connections, government tax submissions, or multilingual support.
- The interface is Azerbaijani only. The architecture separates localization strings to make adding languages later easier.
- Persistent cloud storage requires Firebase configuration. Until it is connected, data may exist only in the current session. Confirm the status of your deployment before relying on it to store business data.
- AI answers are based only on the uploaded data. They are analytical aids, not financial, legal, or tax advice.

---

## Roadmap

- [ ] Complete Firebase Authentication and Firestore persistence
- [ ] Additional business category dashboards
- [ ] Improved PDF report layouts
- [ ] Gross profit analysis with product cost data
- [ ] Multi-language support (architecture ready)
- [ ] Integrations with popular accounting software, after API access is confirmed

---

## Contributing

Contributions are welcome. Please open an issue first to discuss major changes.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

All user-facing text must be in Azerbaijani.

---

## License

<!-- Choose a license, e.g. MIT, and add a LICENSE file -->
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [SheetJS](https://sheetjs.com/) for spreadsheet parsing
- [Recharts](https://recharts.org/) for charts
- [Google Gemini](https://ai.google.dev/) for AI analysis
