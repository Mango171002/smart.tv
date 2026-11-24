"""Writes docs/i18n/review-workbooks/review-<lang>.xlsx and .csv from build/rows/<lang>.json (build.cjs).

   python3 make_workbooks.py [output dir, default: the folder above tools/] [source label]
"""
import csv, json, math, os, sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.environ.get('REVIEW_BUILD') or os.path.join(HERE, 'build')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
LANGS = ['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb']
INFO = json.load(open(os.path.join(BUILD, 'langinfo.json'), encoding='utf-8'))
SOURCE = sys.argv[2] if len(sys.argv) > 2 else 'release candidate 7a6577f'

COLUMNS = [  # header, width, row field
    ('ID', 13, 'id'), ('Priority', 9, 'pri'), ('Risk', 9, 'risk'), ('Page / URL', 24, 'page'),
    ('Location', 32, 'loc'), ('Key', 30, 'key'), ('English reference', 48, 'en'),
    ('Current translation', 48, 't'), ('Max length', 14, 'max'), ('Flags', 32, 'flags'),
    ('AI note or question', 46, 'note'), ('Reviewer decision', 20, None), ('Proposed text', 48, None),
    ('Reviewer comment', 36, None), ('Reviewer name', 18, None), ('Date', 13, None),
]
DECISIONS = ['Approved', 'Approved with change', 'Rejected', 'Question']
OVERALL = ['Approved', 'Approved with changes', 'Not approved']
PRI = {
    1: 'Prelaunch block, FAQ and prelaunch variants (what visitors see now while orders are closed)',
    2: 'Plans, simulator, order summary, buttons and navigation',
    3: 'Legal-adjacent: cookie banner, consent, legal links, legal-entity line (legal sign-off needed)',
    4: 'Other home copy, metadata (titles, descriptions) and structured data',
    5: 'Order and request forms (hidden while orders are closed, needed before orders open)',
    6: 'About and Help pages (staging only, needed before they are published)',
}

HEAD_FILL = PatternFill('solid', fgColor='1F2937')
REV_FILL = PatternFill('solid', fgColor='FFF4C2')
HEAD_FONT = Font(bold=True, color='FFFFFF')
WRAP = Alignment(wrap_text=True, vertical='top')
THIN = Border(bottom=Side(style='thin', color='BBBBBB'))


def cell_value(r, field):
    if field is None:
        return ''
    if field == 'pri':
        return f"P{r['pri']}"
    return r[field]


def put(ws, row, col, value, **kw):
    c = ws.cell(row=row, column=col, value=value)
    if isinstance(value, str) and value.startswith('='):
        c.data_type = 's'  # literal text, never a formula
    for k, v in kw.items():
        setattr(c, k, v)
    return c


def instructions(ws, l, rows):
    name = INFO[l]['name']
    ws.column_dimensions['A'].width = 24
    ws.column_dimensions['B'].width = 110
    lines = [
        ('h', f'SYGMA TV+ — native-speaker review, {name} ({l})'),
        ('p', 'Status', 'PENDING. Every translation in this workbook is an AI translation that no native speaker has validated yet. The « AI note or question » column is an AI review (Claude), not a native validation and not legal advice. Validation stays « pending » until a named native reviewer has filled and signed the « Sign-off » sheet.'),
        ('p', 'Source', f'Current text of the site files on {SOURCE}: src/i18n/dictionaries/{l}.ts (keys without prefix) and src/content/{l}/info.ts (keys starting with « info: »). English reference: the same keys in en.ts and en/info.ts. Scope: every string the site renders in this language (home, windows, forms, About / Help, metadata), including the prelaunch variants shown while orders are closed. Strings identical to English and shorter than 30 characters (brand and technical names) are left out.'),
        ('h2', 'What to check'),
        ('p', 'Meaning', 'The English text is the functional reference (what the text must do on the page), not a wording model. Check that the translation says the same thing, no more and no less.'),
        ('p', 'Naturalness', 'Natural, professional wording for a customer in your country; consistent register and terminology (see below); correct grammar, spelling and typography.'),
        ('p', 'Keep', 'Every fact, figure, price, duration, placeholder ({n}, {price}, {plan}, {email}, {name}, {brand}, {pct}, {amount}, {total}, {entity}), every **bold** pair and every product name (Smart TV, SYGMA TV+, Sygma TV LLC).'),
        ('p', 'Never add a claim', 'No superlatives, « live sports », « international channels », channel volumes, « IPTV », « VIP » or « replay » (blocked by test). Rows flagged « claims » carry a qualifier (24/7 = automated assistant, « where available », device categories, contact channel, picture quality): keep the qualifier.'),
        ('h2', 'Priorities (work in this order)'),
    ]
    for p in range(1, 7):
        n = sum(1 for r in rows if r['pri'] == p)
        lines.append(('p', f'P{p} ({n} rows)', PRI[p]))
    lines += [
        ('p', 'Risk', 'high = visible now (home page, order / trial / support windows, FAQ, search metadata) or legal-adjacent; medium = assistive text (alt, aria labels), blog, 404, open-orders text that returns when orders open, About / Help prelaunch variants; low = forms hidden while orders are closed and About / Help pages.'),
        ('h2', 'How to fill the « Strings » sheet'),
        ('p', 'Do not edit', 'Columns A–K (ID to AI note). Do not delete, insert or merge rows. Sorting and filtering are fine: the ID and the Key identify each row.'),
        ('p', 'Reviewer decision', 'Pick one value from the dropdown: Approved (keep the text as is) · Approved with change (write your wording in « Proposed text ») · Rejected (the text is wrong; explain in « Reviewer comment », and propose a text if you can) · Question (for the owner; write the question in « Reviewer comment »). Leave the cell empty for rows you have not reviewed.'),
        ('p', 'Proposed text', 'The full new text of the string, exactly as it should appear (not a diff). Keep placeholders and ** pairs.'),
        ('p', 'Reviewer comment', 'Why you changed or rejected the text, or your question. Also answer the « AI note or question » when there is one.'),
        ('p', 'Reviewer name, Date', 'Your name and the date (YYYY-MM-DD) on every row you decide.'),
        ('h2', 'Legal and contractual rows'),
        ('p', 'Flag « legal sign-off »', 'Refunds, money-back guarantee, renewal, withdrawal, payment, taxes, contract start, consent and privacy wording, legal links and the legal-entity line. You may comment on grammar and naturalness and propose wording, but the proposal must not change the meaning, and it is applied only after the owner / legal reviewer signs it off. « contractual » / « privacy / consent wording » in the flags means: do not change the meaning. « register xx n » refers to the Phase 11 sensitive-wording register.'),
        ('h2', 'Length limits'),
        ('p', 'Max length', 'Maximum number of characters, spaces included (Excel: =LEN(M2)). A range (70–155) also has a minimum. « without ** » = count without the bold markers; « incl. « | SYGMA TV+ » » = the brand suffix added to the title counts. The flag « layout: n / max » gives the current length. If your wording is longer, keep it but say so in the comment: the layout must be checked before it ships.'),
        ('h2', 'When you are done'),
        ('p', 'Sign-off', 'Fill the « Sign-off » sheet (name, language, date, scope reviewed, overall decision, signature) and return the file to the project contact as .xlsx (or the Strings sheet as CSV UTF-8). Do not change the sheet names or the column headers.'),
        ('h2', f'{name}: language rules (from the Phase 13 AI review)'),
    ]
    for s in INFO[l]['rules']:
        lines.append(('p', '', s))
    lines.append(('h2', f'{name}: terminology used on the site'))
    for c, t in INFO[l]['terms']:
        lines.append(('p', c, t))
    r = 1
    for item in lines:
        if item[0] == 'h':
            put(ws, r, 1, item[1], font=Font(bold=True, size=14))
            ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=2)
            r += 2
        elif item[0] == 'h2':
            r += 0 if r == 1 else 1
            put(ws, r, 1, item[1], font=Font(bold=True, size=12))
            ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=2)
            r += 1
        else:
            put(ws, r, 1, item[1], font=Font(bold=True), alignment=WRAP)
            put(ws, r, 2, item[2], alignment=WRAP)
            ws.row_dimensions[r].height = 15 * max(1, math.ceil(len(item[2]) / 120))
            r += 1


def strings(ws, rows):
    for i, (h, w, f) in enumerate(COLUMNS, 1):
        put(ws, 1, i, h, font=HEAD_FONT if f is not None else Font(bold=True), fill=HEAD_FILL if f is not None else REV_FILL, alignment=WRAP)
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[1].height = 30
    for ri, r in enumerate(rows, 2):
        lines = 1
        for ci, (h, w, f) in enumerate(COLUMNS, 1):
            v = cell_value(r, f)
            put(ws, ri, ci, v, alignment=WRAP, border=THIN)
            if v:
                lines = max(lines, math.ceil(len(str(v)) / (w * 1.15)))
        ws.row_dimensions[ri].height = min(15 * lines, 300)
    last = len(rows) + 1
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = f'A1:{get_column_letter(len(COLUMNS))}{last}'
    dv = DataValidation(type='list', formula1='"' + ','.join(DECISIONS) + '"', allow_blank=True, showDropDown=False)
    dv.error = 'Choose Approved, Approved with change, Rejected or Question.'
    dv.errorTitle = 'Reviewer decision'
    dv.prompt = 'Approved / Approved with change / Rejected / Question'
    dv.promptTitle = 'Reviewer decision'
    dv.showErrorMessage = True
    dv.showInputMessage = True
    ws.add_data_validation(dv)
    dv.add(f'L2:L{last}')


def signoff(ws, l):
    name = INFO[l]['name']
    ws.column_dimensions['A'].width = 34
    ws.column_dimensions['B'].width = 70
    put(ws, 1, 1, f'Native-speaker sign-off — {name} ({l})', font=Font(bold=True, size=14))
    ws.merge_cells('A1:B1')
    put(ws, 2, 1, 'Status: PENDING — not signed. Leave a field empty until it is true.', font=Font(italic=True))
    fields = ['Reviewer name', 'Language', 'Date (YYYY-MM-DD)', 'Scope reviewed (priorities / rows)', 'Overall decision', 'Signature']
    for i, f in enumerate(fields):
        r = 4 + i
        put(ws, r, 1, f, font=Font(bold=True), alignment=WRAP)
        put(ws, r, 2, None, fill=REV_FILL, border=Border(bottom=Side(style='thin', color='888888')))
        ws.row_dimensions[r].height = 36 if f == 'Signature' else 22
    dv = DataValidation(type='list', formula1='"' + ','.join(OVERALL) + '"', allow_blank=True)
    dv.prompt = 'Approved / Approved with changes / Not approved'
    dv.showInputMessage = True
    ws.add_data_validation(dv)
    dv.add('B8')
    put(ws, 11, 1, 'Legal sign-off (rows flagged « legal sign-off »)', font=Font(bold=True, size=12))
    for i, f in enumerate(['Legal reviewer name', 'Date (YYYY-MM-DD)', 'Decision / reference', 'Signature']):
        r = 12 + i
        put(ws, r, 1, f, font=Font(bold=True))
        put(ws, r, 2, None, fill=REV_FILL, border=Border(bottom=Side(style='thin', color='888888')))
        ws.row_dimensions[r].height = 36 if f == 'Signature' else 22
    put(ws, 17, 1, 'By signing, the reviewer confirms they are a native speaker of this language and have reviewed the scope stated above. A signed row is « native-reviewed »; legal rows also need the legal sign-off before they change.', alignment=WRAP)
    ws.merge_cells('A17:B17')
    ws.row_dimensions[17].height = 45


os.makedirs(OUT, exist_ok=True)
for l in LANGS:
    rows = json.load(open(os.path.join(BUILD, 'rows', f'{l}.json'), encoding='utf-8'))
    wb = Workbook()
    ins = wb.active
    ins.title = 'Instructions'
    instructions(ins, l, rows)
    strings(wb.create_sheet('Strings'), rows)
    signoff(wb.create_sheet('Sign-off'), l)
    for ws in wb.worksheets:
        ws.page_setup.orientation = 'landscape'
        ws.page_setup.fitToWidth = 1
        ws.page_setup.fitToHeight = 0
        ws.sheet_properties.pageSetUpPr.fitToPage = True
    wb['Strings'].print_title_rows = '1:1'
    wb.active = 1
    wb.properties.title = f'SYGMA TV+ native review — {INFO[l]["name"]}'
    wb.properties.creator = 'SYGMA TV+ localisation (AI-prepared, pending native review)'
    wb.save(os.path.join(OUT, f'review-{l}.xlsx'))
    with open(os.path.join(OUT, f'review-{l}.csv'), 'w', encoding='utf-8-sig', newline='') as fh:
        w = csv.writer(fh, lineterminator='\r\n')
        w.writerow([c[0] for c in COLUMNS])
        for r in rows:
            w.writerow([cell_value(r, c[2]) for c in COLUMNS])
    print(l, len(rows))
