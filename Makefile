all:
	pandoc -t plain --filter pandoc-tangle .\scrapple.md
	pandoc -t html5 -s .\scrapple.md --filter pandoc-annotate-codeblocks -o scrapple.html