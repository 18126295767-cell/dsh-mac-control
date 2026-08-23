import Foundation
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count >= 4 else {
    fputs("usage: encode-gif.swift <output.gif> <delay-seconds> <frame.png>...\n", stderr)
    exit(2)
}

let outputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let delay = Double(CommandLine.arguments[2]) ?? 0.5
let frameURLs = CommandLine.arguments.dropFirst(3).map { URL(fileURLWithPath: $0) }
guard let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, UTType.gif.identifier as CFString, frameURLs.count, nil) else {
    fputs("could not create GIF destination\n", stderr)
    exit(1)
}

let loopProperties = [
    kCGImagePropertyGIFDictionary as String: [
        kCGImagePropertyGIFLoopCount as String: 0,
    ],
] as CFDictionary
CGImageDestinationSetProperties(destination, loopProperties)

for url in frameURLs {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        fputs("could not read frame: \(url.path)\n", stderr)
        exit(1)
    }
    let frameProperties = [
        kCGImagePropertyGIFDictionary as String: [
            kCGImagePropertyGIFDelayTime as String: delay,
            kCGImagePropertyGIFUnclampedDelayTime as String: delay,
        ],
    ] as CFDictionary
    CGImageDestinationAddImage(destination, image, frameProperties)
}

guard CGImageDestinationFinalize(destination) else {
    fputs("could not finalize GIF\n", stderr)
    exit(1)
}
