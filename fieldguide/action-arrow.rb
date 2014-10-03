#!/usr/bin/env ruby

class String
  def indent
    self.match(/^(\s*)/) do |md|
      if md.post_match.empty?
        100000
      else
        md[0].length
      end
    end
  end
end

ns = []
while line = gets
  line.chomp!
  # First check if we have to add a 'return' line
  loop do
    break if ns.empty?
    n = ns[-1]
    if line.indent <= n
      puts (' ' * (n + 2)) + 'return'
      ns.pop
    else
      break
    end
  end
  # Then check if this line starts an action
  if line =~ /[-=]>>$/
    ns.push line.indent
    line = line[0..-2]
  end
  puts line
end
