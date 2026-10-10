import XCTest
import SwiftTreeSitter
import TreeSitterClockwork

final class TreeSitterClockworkTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_clockwork())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Clockwork grammar")
    }
}
